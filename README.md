# GitClawd 🦞

A Git client with Claude AI built-in. Think GitKraken meets Claude Code.

![GitClawd Screenshot](docs/screenshot.png)

## What is this?

GitClawd is a visual Git client where you can ask Claude questions about your repository. Select a commit, ask "what does this change do?", and get an actual explanation. Browse your commit history, view diffs, and have Claude help you understand complex code changes.

## Features

- **Visual commit graph** - See your branch history with colored lanes for different branches
- **Claude AI assistant** - Ask questions about commits, diffs, branches, and your codebase
- **File tree view** - Browse changed files per commit with syntax-highlighted diffs
- **Persistent chat sessions** - Conversations are saved per repository
- **Native desktop app** - Electron-based, works on macOS, Windows, and Linux

## Quick Start

### Prerequisites

- Node.js 20+
- An Anthropic API key (set as `ANTHROPIC_API_KEY` environment variable)

### Run in Development

```bash
# Clone the repo
git clone https://github.com/joshualedbetter/gitclawd.git
cd gitclawd

# Install dependencies
cd web && npm install
cd ../app && npm install

# Start the server (terminal 1)
cd web && node server.js

# Start the app (terminal 2)
cd app && npm run electron
```

### Build for Distribution

```bash
cd app
npm run dist:mac    # macOS .dmg
npm run dist:win    # Windows installer
npm run dist:linux  # Linux AppImage
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  GitClawd (Electron)                                        │
├─────────────┬─────────────────────────┬─────────────────────┤
│  Commit     │      Diff Viewer        │    Claude Panel     │
│  Graph      │                         │                     │
│             │  + import { foo }       │  Q: What changed?   │
│  ● commit1  │  - import { bar }       │                     │
│  │          │                         │  A: This commit     │
│  ● commit2  │  function test() {      │  refactors the      │
│  │          │    // ...               │  imports to use...  │
│  ● commit3  │  }                      │                     │
│             │                         │                     │
└─────────────┴─────────────────────────┴─────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  Express Server + SDK   │
              │  - Git operations       │
              │  - Claude Agent SDK     │
              │  - MCP Tools            │
              └─────────────────────────┘
```

## Claude's Tools

Claude has access to custom MCP tools for interacting with your repository:

| Tool | Description |
|------|-------------|
| `GetGitLog` | Fetch commit history with messages, authors, dates |
| `GetGitStatus` | Get current branch and working tree status |
| `GetFileDiff` | Get the diff for any commit or working changes |
| `GetSelectedCommit` | See which commit you've selected in the UI |
| `GetBranches` | List all local and remote branches |

Plus standard tools: `Read`, `Glob`, `Grep` for exploring your codebase.

## Example Questions

- "What does this commit do?"
- "Summarize the changes in the last week"
- "Which files change the most in this repo?"
- "Explain the difference between main and this branch"
- "What's the history of changes to `auth.js`?"
- "Are there any potential bugs in this diff?"

## Project Structure

```
gitclawd/
├── app/                    # Electron + React frontend
│   ├── electron/          # Main process (window, IPC)
│   ├── src/               # React components
│   │   ├── components/    # UI (CommitGraph, DiffViewer, ClaudePanel)
│   │   └── lib/           # Utilities (chat storage)
│   └── package.json       # Build config + electron-builder
├── web/                   # Backend server
│   └── server.js          # Express API + Claude Agent SDK
├── spikes/                # Early prototypes
└── design/                # Design explorations
```

## Roadmap

- [x] Visual commit graph
- [x] Diff viewer with syntax highlighting
- [x] Claude chat with persistence
- [ ] Write operations (stage, commit)
- [ ] Branch operations (create, switch, merge)
- [ ] GitHub/GitLab PR integration
- [ ] Conflict resolution assistance
- [ ] Smaller binary via Tauri

## Why "Clawd"?

Claude + Claw = Clawd. 🦞

## License

MIT

## Contributing

Issues and PRs welcome!
