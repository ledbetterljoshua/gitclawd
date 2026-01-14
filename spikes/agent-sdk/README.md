# GitClawd Agent SDK Spike

Proof of concept showing that we can give Claude custom MCP tools and it will use them correctly.

## Key Finding

**YES - Claude correctly uses custom MCP tools when provided.**

The context flow works as expected:
1. Custom MCP server with git tools is registered via `mcpServers` option
2. Claude sees them in the tool list as `mcp__git-tools__GetGitLog`, etc.
3. When asked about git operations, Claude uses the custom tools (not Bash)
4. The tools execute in-process and return structured data
5. Claude incorporates the results into its response

## Running the Spike

```bash
cd /Users/joshualedbetter/gitclawd/spikes/agent-sdk
npm install
node index.mjs
```

Or with a custom prompt:
```bash
node index.mjs "Show me the commit history"
node index.mjs "What changed in the last commit?"
node index.mjs "What's the repo status?"
```

## What's Implemented

Three custom MCP tools:

1. **GetGitLog** - Returns structured commit history
   - Parameters: `limit`, `since`, `author`
   - Returns: Array of commits with hash, author, date, message

2. **GetGitStatus** - Returns current repo status
   - Returns: Branch, head commit, staged/unstaged/untracked files

3. **GetFileDiff** - Returns diff for a commit or file
   - Parameters: `commit`, `file`, `base`
   - Returns: Diff content and stats

## Architecture Notes

### In-Process MCP Server

The SDK supports in-process MCP servers via `createSdkMcpServer()`:

```javascript
const gitMcpServer = createSdkMcpServer({
  name: 'git-tools',
  version: '1.0.0',
  tools: [
    tool('GetGitLog', 'description', { limit: z.number().optional() }, async (args) => {
      // Handler runs in same process
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    })
  ]
});
```

Register it in the query options:
```javascript
const result = query({
  prompt: "...",
  options: {
    mcpServers: {
      'git-tools': gitMcpServer
    },
    allowedTools: ['mcp__git-tools__GetGitLog', ...]
  }
});
```

### Tool Naming Convention

MCP tools are named: `mcp__<server-name>__<tool-name>`

Example: `mcp__git-tools__GetGitLog`

### System Prompt Guidance

While Claude will use the tools even without explicit guidance, adding context helps:

```javascript
systemPrompt: {
  type: 'preset',
  preset: 'claude_code',
  append: 'For git operations, use the GetGitLog, GetGitStatus, GetFileDiff tools.'
}
```

## Test Results

All tests passed. Claude used custom MCP tools correctly:

| Query | Tools Used |
|-------|------------|
| "What's the commit history?" | GetGitLog |
| "What's the repo status?" | GetGitStatus |
| "What changed in the last commit?" | GetFileDiff |
| Complex summary query | All three (parallel) |

## Next Steps for GitClawd

1. Expand tool set: branches, remotes, blame, staging, etc.
2. Build proper UI that streams SDK messages
3. Consider multi-repo support via `cwd` parameter
4. Add conversation persistence via `resume` option

## Key API References

- `query()` - Main entry point for sending prompts
- `createSdkMcpServer()` - Create in-process MCP server
- `tool()` - Define a tool with Zod schema
- `mcpServers` option - Register MCP servers
- `allowedTools` option - Auto-allow specific tools
- SDK message types: `assistant`, `result`, `system`
