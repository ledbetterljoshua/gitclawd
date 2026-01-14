# GitClawd - Shared Context for All Claudes

## The Vision

GitClawd is a Git client where Claude is a first-class collaborator, not a chat sidebar.

**The core insight:** Claude already has Bash tools via the Agent SDK. Claude can run any git command. We don't need to build buttons for every operation - we need Claude to be able to do things when asked.

- Want to commit? Ask Claude.
- Want to resolve a conflict? Ask Claude.
- Want to understand a confusing diff? Ask Claude.
- Want to cherry-pick specific changes? Ask Claude.

Buttons are conveniences for common actions. Claude is the power user interface.

## What Exists (Jan 2026)

**Working:**
- Electron app with React frontend
- Commit graph visualization
- Diff viewer with syntax highlighting
- Claude chat panel with persistent sessions
- Claude has MCP tools: GetGitLog, GetGitStatus, GetFileDiff, GetSelectedCommit, GetBranches
- Plus standard tools: Read, Glob, Grep
- Marketing page deployed

**Not working yet:**
- Write operations (stage, commit, branch) - Claude has tools but UI doesn't reflect changes
- Claude can't control the UI (highlight commits, scroll to files)
- No streaming responses
- Security issues (global server state, path traversal)

## Architecture

```
/Users/joshualedbetter/gitclawd/
├── app/                    # Electron + React frontend
│   ├── electron/          # Main process
│   ├── src/               # React components
│   │   ├── components/    # CommitGraph, DiffViewer, ClaudePanel
│   │   └── lib/           # chatStorage
│   └── dist/              # Built frontend (served by web server)
├── web/                   # Backend
│   └── server.js          # Express + Agent SDK + MCP tools
├── index.html             # Marketing page
└── .claude/               # Agent infrastructure
    ├── CLAUDE.md          # This file - shared context
    └── agents/            # Agent prompts
```

## Critical Feedback (From Review Session)

### What Everyone Agreed On

1. **Claude feels bolted on** - It's a chat sidebar, not native. Users can't see what Claude sees. No way to reference specific lines.

2. **No 10x moment yet** - The vision is "Claude controlling the UI" - highlighting commits as it explains, showing its work. Currently it's just text responses.

3. **Write operations are table stakes** - Can't call it a Git client if you can't commit.

4. **Security issues** - Global server state (one repo at a time), path traversal, no input validation.

### The Wedge

**Conflict resolution** was identified as the killer feature. Every developer dreads merge conflicts. Claude can read both sides, understand intent, suggest resolution. No other tool does this well.

### What We're NOT Building

- A "commit message generator button" - Just ask Claude
- Buttons for every git operation - Claude can do it
- A GitKraken clone - We're building something new

## How Claudes Should Work Together

### Memory Protocol

**Small insights** → Update this CLAUDE.md file
**Large documentation** → Create a skill in ~/.claude/skills/
**Decisions that affect everyone** → Update the roadmap (product owns this)

### File Ownership

| Area | Owner | Key Files |
|------|-------|-----------|
| Product strategy | Product Claude | /docs/ROADMAP.md, /docs/PRD.md |
| Frontend | Engineer Claude | /app/src/ |
| Backend/SDK | Engineer Claude | /web/server.js |
| Styles/UX | Designer Claude | /app/src/*.css |
| Security | Security Claude | (audits all) |
| Testing | QA Claude | /app/src/**/*.test.ts |

### When Spawning Work

1. Read this file first
2. Check if there's a skill for your domain
3. Do your work
4. Update shared context if you learned something others need

## Current Priorities (Updated by Product)

1. **Make Claude's context visible** - Show users what Claude sees
2. **Enable write operations** - Claude can already do this via Bash, but UI needs to reflect state changes
3. **Fix security issues** - Session-based state, input validation
4. **Streaming responses** - Show Claude working

## Open Questions

- How should Claude signal it's done an action that changes git state? (UI refresh?)
- Should we show a "Claude is running: git commit -m '...'" indicator?
- How do we handle Claude making mistakes? (undo? confirmation?)

---

*Last updated: Jan 14, 2026*
*Update this file when you learn something all Claudes should know*
