/**
 * GitClawd Agent SDK Spike
 *
 * Tests whether we can give Claude custom MCP tools that it uses correctly.
 * Creates git operation tools and verifies Claude prefers them over Bash.
 */

import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import { execSync } from 'child_process';
import path from 'path';

// The test repo path
const TEST_REPO = '/Users/joshualedbetter/gitclawd/test-repos/complex-repo';

/**
 * Execute a git command in the test repo
 */
function git(args, cwd = TEST_REPO) {
  try {
    const result = execSync(`git ${args}`, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    return result.trim();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Create custom MCP server with git tools
 */
const gitMcpServer = createSdkMcpServer({
  name: 'git-tools',
  version: '1.0.0',
  tools: [
    // GetGitLog - returns parsed commit history
    tool(
      'GetGitLog',
      'Get the commit history of a git repository. Returns structured commit information including hash, author, date, and message.',
      {
        limit: z.number().optional().describe('Maximum number of commits to return (default: 10)'),
        since: z.string().optional().describe('Show commits after this date (e.g., "2024-01-01")'),
        author: z.string().optional().describe('Filter by author name or email'),
      },
      async (args) => {
        console.log('\n[MCP] GetGitLog called with:', JSON.stringify(args));

        const limit = args.limit || 10;
        let gitArgs = `log --format={"hash":"%H","short_hash":"%h","author":"%an","email":"%ae","date":"%ai","message":"%s"}, -n ${limit}`;

        if (args.since) {
          gitArgs += ` --since="${args.since}"`;
        }
        if (args.author) {
          gitArgs += ` --author="${args.author}"`;
        }

        const output = git(gitArgs);

        if (typeof output === 'object' && output.error) {
          return { content: [{ type: 'text', text: `Error: ${output.error}` }], isError: true };
        }

        // Parse the output into structured JSON
        try {
          // The output is comma-separated JSON objects, wrap in array
          const jsonStr = '[' + output.replace(/,\s*$/, '') + ']';
          const commits = JSON.parse(jsonStr);

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ commits, total: commits.length }, null, 2)
            }]
          };
        } catch (parseError) {
          // Fallback to simple format if JSON parsing fails
          const simpleOutput = git(`log --oneline -n ${limit}`);
          return {
            content: [{
              type: 'text',
              text: `Commit history:\n${simpleOutput}`
            }]
          };
        }
      }
    ),

    // GetGitStatus - returns current repo status
    tool(
      'GetGitStatus',
      'Get the current status of a git repository including staged, unstaged, and untracked files.',
      {},
      async () => {
        console.log('\n[MCP] GetGitStatus called');

        const statusOutput = git('status --porcelain=v2 --branch');
        const branch = git('branch --show-current');
        const headCommit = git('rev-parse HEAD');

        if (typeof statusOutput === 'object' && statusOutput.error) {
          return { content: [{ type: 'text', text: `Error: ${statusOutput.error}` }], isError: true };
        }

        // Parse porcelain v2 output
        const lines = statusOutput.split('\n');
        const files = {
          staged: [],
          unstaged: [],
          untracked: []
        };

        for (const line of lines) {
          if (line.startsWith('1 ') || line.startsWith('2 ')) {
            // Changed entries
            const parts = line.split(' ');
            const staged = parts[1][0] !== '.';
            const unstaged = parts[1][1] !== '.';
            const filename = parts.slice(8).join(' ');

            if (staged) files.staged.push(filename);
            if (unstaged) files.unstaged.push(filename);
          } else if (line.startsWith('? ')) {
            // Untracked
            files.untracked.push(line.slice(2));
          }
        }

        const result = {
          branch: branch,
          headCommit: headCommit,
          clean: files.staged.length === 0 && files.unstaged.length === 0 && files.untracked.length === 0,
          files
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    ),

    // GetFileDiff - returns diff for a specific commit or file
    tool(
      'GetFileDiff',
      'Get the diff (changes) for a specific commit, file, or between commits.',
      {
        commit: z.string().optional().describe('Commit hash to show diff for'),
        file: z.string().optional().describe('File path to show diff for'),
        base: z.string().optional().describe('Base commit for comparison'),
      },
      async (args) => {
        console.log('\n[MCP] GetFileDiff called with:', JSON.stringify(args));

        let gitArgs = 'diff';

        if (args.commit && args.base) {
          gitArgs = `diff ${args.base}..${args.commit}`;
        } else if (args.commit) {
          gitArgs = `show ${args.commit} --format=`;
        }

        if (args.file) {
          gitArgs += ` -- ${args.file}`;
        }

        const output = git(gitArgs);

        if (typeof output === 'object' && output.error) {
          return { content: [{ type: 'text', text: `Error: ${output.error}` }], isError: true };
        }

        // Parse the diff into a structured format
        const diffStats = git(`diff --stat ${args.commit || 'HEAD'}${args.file ? ` -- ${args.file}` : ''}`);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              diff: output || '(no changes)',
              stats: diffStats || '(no stats)'
            }, null, 2)
          }]
        };
      }
    ),
  ]
});

/**
 * Run the test query
 */
async function main() {
  const prompt = process.argv[2] || "What's the commit history of this repo?";

  console.log('='.repeat(60));
  console.log('GitClawd Agent SDK Spike');
  console.log('='.repeat(60));
  console.log(`\nTest repo: ${TEST_REPO}`);
  console.log(`Prompt: "${prompt}"`);
  console.log('\n' + '-'.repeat(60));

  // Verify the repo exists
  try {
    const repoCheck = git('rev-parse --git-dir');
    if (repoCheck.error) {
      console.error('Error: Test repo not found or not a git repo');
      process.exit(1);
    }
    console.log('Test repo verified.\n');
  } catch (e) {
    console.error('Error: Could not access test repo:', e.message);
    process.exit(1);
  }

  // Track which tools are used
  const toolsUsed = [];

  try {
    const result = query({
      prompt,
      options: {
        cwd: TEST_REPO,

        // Register our custom MCP server
        mcpServers: {
          'git-tools': gitMcpServer
        },

        // Disable default tools to force use of our MCP tools
        // Actually, let's keep some basic ones but disallow Bash for git
        disallowedTools: ['Bash'],

        // Use default Claude Code system prompt with custom addition
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `
IMPORTANT: For all git operations, you MUST use the custom git MCP tools:
- GetGitLog: For viewing commit history
- GetGitStatus: For checking repository status
- GetFileDiff: For viewing file changes and diffs

Do NOT use Bash for git commands. Always use the provided MCP tools.
The current repository is at: ${TEST_REPO}
`
        },

        // Auto-allow our MCP tools
        allowedTools: [
          'mcp__git-tools__GetGitLog',
          'mcp__git-tools__GetGitStatus',
          'mcp__git-tools__GetFileDiff',
          'Read',
          'Glob'
        ],

        // Bypass permission prompts for demo
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,

        // Limit turns for testing
        maxTurns: 3,
      }
    });

    console.log('Processing response...\n');

    for await (const message of result) {
      if (message.type === 'system' && message.subtype === 'init') {
        console.log('[System] Initialized with tools:', message.tools.join(', '));
        console.log('[System] MCP servers:', message.mcp_servers.map(s => `${s.name}(${s.status})`).join(', '));
        console.log();
      }

      if (message.type === 'assistant') {
        // Check for tool use
        for (const block of message.message.content) {
          if (block.type === 'tool_use') {
            toolsUsed.push(block.name);
            console.log(`[Tool Use] ${block.name}`);
            console.log(`  Input: ${JSON.stringify(block.input)}`);
          }
          if (block.type === 'text') {
            console.log(`\n[Claude Response]\n${block.text}`);
          }
        }
      }

      if (message.type === 'result') {
        console.log('\n' + '-'.repeat(60));
        console.log('[Result]');
        console.log(`  Success: ${message.subtype === 'success'}`);
        console.log(`  Turns: ${message.num_turns}`);
        console.log(`  Cost: $${message.total_cost_usd.toFixed(4)}`);
        if (message.subtype === 'success' && message.result) {
          console.log(`  Final: ${message.result.slice(0, 200)}...`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION');
    console.log('='.repeat(60));
    console.log('\nTools used during this run:');
    toolsUsed.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

    const usedCustomTools = toolsUsed.some(t => t.startsWith('mcp__git-tools__'));
    const usedBash = toolsUsed.includes('Bash');

    console.log('\nResult:');
    if (usedCustomTools && !usedBash) {
      console.log('  [SUCCESS] Claude used custom MCP tools for git operations!');
    } else if (usedCustomTools && usedBash) {
      console.log('  [PARTIAL] Claude used both MCP tools and Bash');
    } else if (!usedCustomTools && usedBash) {
      console.log('  [FAIL] Claude used Bash instead of MCP tools');
    } else {
      console.log('  [UNKNOWN] Claude didn\'t use any git-related tools');
    }

  } catch (error) {
    console.error('Error during query:', error);
    process.exit(1);
  }
}

main();
