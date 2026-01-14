/**
 * GitClawd Web Server
 *
 * Express server that:
 * - Serves the static frontend
 * - Handles git operations via API
 * - Integrates Claude via Agent SDK
 */

import express from 'express';
import { execSync } from 'child_process';
import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// Serve the React app from the app/dist directory
app.use(express.static(path.join(__dirname, '../app/dist')));

// Current repo state
let currentRepoPath = null;
let uiState = { selectedCommit: null };

/**
 * Execute git command
 */
function git(args, cwd = currentRepoPath) {
  if (!cwd) return { error: 'No repository open' };
  try {
    return execSync(`git ${args}`, { cwd, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }).trim();
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Parse git log into structured commits
 */
function getCommits(limit = 200) {
  const format = '%H|%P|%s|%an|%ai|%D';
  const output = git(`log --pretty=format:'${format}' --all --topo-order -n ${limit}`);
  if (typeof output !== 'string') return [];

  return output.split('\n').filter(Boolean).map(line => {
    const parts = line.split('|');
    return {
      hash: parts[0],
      parents: parts[1] ? parts[1].split(' ').filter(Boolean) : [],
      message: parts[2],
      author: parts[3],
      date: parts[4],
      refs: parts[5] ? parts[5].split(', ').map(r => r.trim()).filter(Boolean) : []
    };
  });
}

// API Routes
app.post('/api/open-repo', (req, res) => {
  const { path: repoPath } = req.body;
  if (!repoPath) return res.json({ error: 'No path provided' });

  try {
    execSync('git rev-parse --git-dir', { cwd: repoPath, encoding: 'utf-8' });
    currentRepoPath = repoPath;
    res.json({ success: true, path: repoPath });
  } catch (e) {
    res.json({ error: 'Not a git repository' });
  }
});

app.get('/api/commits', (req, res) => {
  res.json({ commits: getCommits() });
});

app.get('/api/status', (req, res) => {
  const branch = git('branch --show-current');
  const status = git('status --porcelain');
  const files = { staged: [], unstaged: [], untracked: [] };

  if (typeof status === 'string') {
    status.split('\n').forEach(line => {
      if (!line) return;
      const [index, working] = [line[0], line[1]];
      const file = line.slice(3);
      if (index !== ' ' && index !== '?') files.staged.push(file);
      if (working !== ' ' && working !== '?') files.unstaged.push(file);
      if (index === '?') files.untracked.push(file);
    });
  }

  res.json({ branch, files, clean: !files.staged.length && !files.unstaged.length });
});

app.get('/api/diff/:commit', (req, res) => {
  const diff = git(`show ${req.params.commit} --format=`);
  const stat = git(`show ${req.params.commit} --stat --format=`);
  res.json({ diff, stat });
});

app.get('/api/diff', (req, res) => {
  const diff = git('diff');
  const staged = git('diff --staged');
  res.json({ unstaged: diff, staged });
});

// Working changes - enhanced endpoint with proper stats
app.get('/api/working-changes', (req, res) => {
  // Get status to know which files changed
  const status = git('status --porcelain');
  if (typeof status !== 'string') {
    return res.json({ error: status.error, hasChanges: false });
  }

  const files = { staged: [], unstaged: [], untracked: [] };
  const statusLines = status.split('\n').filter(Boolean);

  statusLines.forEach(line => {
    const [index, working] = [line[0], line[1]];
    const file = line.slice(3);
    if (index !== ' ' && index !== '?') files.staged.push({ path: file, status: index });
    if (working !== ' ' && working !== '?') files.unstaged.push({ path: file, status: working });
    if (index === '?') files.untracked.push({ path: file, status: '?' });
  });

  const hasChanges = files.staged.length > 0 || files.unstaged.length > 0 || files.untracked.length > 0;

  // Get actual diffs
  const stagedDiff = git('diff --staged');
  const unstagedDiff = git('diff');

  // Get diff stats
  const stagedStat = git('diff --staged --stat');
  const unstagedStat = git('diff --stat');

  res.json({
    hasChanges,
    files,
    staged: {
      diff: typeof stagedDiff === 'string' ? stagedDiff : '',
      stat: typeof stagedStat === 'string' ? stagedStat : '',
      count: files.staged.length
    },
    unstaged: {
      diff: typeof unstagedDiff === 'string' ? unstagedDiff : '',
      stat: typeof unstagedStat === 'string' ? unstagedStat : '',
      count: files.unstaged.length
    },
    untracked: {
      count: files.untracked.length,
      files: files.untracked.map(f => f.path)
    }
  });
});

app.post('/api/select-commit', (req, res) => {
  uiState.selectedCommit = req.body.hash;
  res.json({ success: true });
});

app.get('/api/repo-info', (req, res) => {
  res.json({
    path: currentRepoPath,
    selectedCommit: uiState.selectedCommit
  });
});

// Claude integration
app.post('/api/claude', async (req, res) => {
  const { message } = req.body;
  if (!currentRepoPath) return res.json({ error: 'No repository open' });

  const gitMcpServer = createSdkMcpServer({
    name: 'git-tools',
    version: '1.0.0',
    tools: [
      tool('GetGitLog', 'Get commit history', {
        limit: z.number().optional(),
      }, async (args) => ({
        content: [{ type: 'text', text: JSON.stringify({ commits: getCommits(args.limit || 50) }) }]
      })),

      tool('GetGitStatus', 'Get repo status', {}, async () => {
        const branch = git('branch --show-current');
        const status = git('status --porcelain');
        return { content: [{ type: 'text', text: JSON.stringify({ branch, status }) }] };
      }),

      tool('GetFileDiff', 'Get diff for commit or working changes', {
        commit: z.string().optional(),
        file: z.string().optional(),
      }, async (args) => {
        let cmd = args.commit ? `show ${args.commit} --format=` : 'diff';
        if (args.file) cmd += ` -- ${args.file}`;
        return { content: [{ type: 'text', text: git(cmd) }] };
      }),

      tool('GetSelectedCommit', 'Get info about selected commit in UI', {}, async () => {
        if (!uiState.selectedCommit) return { content: [{ type: 'text', text: 'No commit selected' }] };
        const info = git(`show ${uiState.selectedCommit} --format='%H|%s|%an|%ai' --no-patch`);
        return { content: [{ type: 'text', text: `Selected: ${info}` }] };
      }),

      tool('GetBranches', 'Get list of all branches in the repository', {}, async () => {
        const branches = git('branch -a');
        const current = git('branch --show-current');
        return { content: [{ type: 'text', text: JSON.stringify({ branches: branches.split('\n').map(b => b.trim()), current }) }] };
      }),
    ]
  });

  const responses = [];

  try {
    const result = query({
      prompt: message,
      options: {
        cwd: currentRepoPath,
        mcpServers: { 'git-tools': gitMcpServer },
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `You are GitClawd's assistant. Help users with their git repository.
Use the custom git tools: GetGitLog, GetGitStatus, GetFileDiff, GetSelectedCommit.
Be concise. Current repo: ${currentRepoPath}`
        },
        allowedTools: [
          'mcp__git-tools__GetGitLog',
          'mcp__git-tools__GetGitStatus',
          'mcp__git-tools__GetFileDiff',
          'mcp__git-tools__GetSelectedCommit',
          'mcp__git-tools__GetBranches',
          'Read', 'Glob', 'Grep'
        ],
        disallowedTools: ['Bash'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 5,
      }
    });

    for await (const msg of result) {
      if (msg.type === 'assistant') {
        for (const block of msg.message.content) {
          if (block.type === 'text') responses.push({ type: 'text', content: block.text });
          if (block.type === 'tool_use') responses.push({ type: 'tool', name: block.name });
        }
      }
      if (msg.type === 'result') {
        responses.push({ type: 'done', cost: msg.total_cost_usd });
      }
    }

    res.json({ responses });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`GitClawd running at http://localhost:${PORT}`);
  console.log('Open a repo by clicking the button or POST to /api/open-repo');
});
