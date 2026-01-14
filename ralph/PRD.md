# GitClawd PRD

## What is GitClawd?
A GitKraken clone with Claude at its heart. Visual git client where Claude is the primary interface for actions.

## Core Value Props
1. **Beautiful diff viewer** - The main thing. See what changed, clearly.
2. **Visual commit graph** - See the shape of your repo's history
3. **Claude as interface** - Ask questions, perform operations via natural language

## Current State
- Basic web app running at localhost:3456
- Commit graph renders (needs polish)
- Click commit → see details panel
- Claude chat works with custom MCP tools
- **MISSING: Good diff viewer**

## Priority Items (in order)

### P0 - Core Experience
- [ ] **Diff viewer panel** - Full-width diff view when commit selected, syntax highlighted, side-by-side or unified
- [ ] **File tree in diff** - Show which files changed, click to jump to that file's diff
- [ ] **Working changes diff** - See unstaged/staged changes, not just commit diffs

### P1 - Graph Polish
- [ ] **Better branch visualization** - Cleaner lanes, smoother curves for merges
- [ ] **Commit node hover** - Show quick info on hover before clicking
- [ ] **Scroll/zoom** - Handle large repos gracefully

### P2 - Claude Intelligence
- [ ] **Context awareness** - Claude knows what you're looking at (selected commit, visible diff)
- [ ] **Explain this diff** - Ask Claude to explain changes in plain English
- [ ] **Suggest commit message** - Based on staged changes

### P3 - Git Operations
- [ ] **Stage/unstage files** - Via UI or Claude
- [ ] **Create commits** - With Claude-generated messages
- [ ] **Branch operations** - Create, switch, delete

### P4 - Design Polish
- [ ] **Consistent visual language** - Colors, spacing, typography
- [ ] **Loading states** - Spinners, skeletons where needed
- [ ] **Error handling** - Graceful failures with helpful messages

## Technical Context

### File Structure
```
/Users/joshualedbetter/gitclawd/
├── web/
│   ├── server.js      # Express + Agent SDK
│   ├── index.html     # Frontend (single file currently)
│   └── package.json
├── test-repos/
│   └── complex-repo/  # Test repo with branches
└── ralph/
    ├── PRD.md         # This file
    ├── CHECKLIST.md   # Current item being worked
    └── run.sh         # Script to run ralph loop
```

### Running the App
```bash
cd /Users/joshualedbetter/gitclawd/web
node server.js
# Open http://localhost:3456
```

### Test Repo
`/Users/joshualedbetter/gitclawd/test-repos/complex-repo` - has branches, merges, good for testing

### Real Repo for Testing
`/Users/joshualedbetter/code/ladder/ladder-web` - Joshua's work repo, complex history

## Verification
Each item should be verified by:
1. Opening the web app in browser
2. Testing the specific feature
3. Taking a screenshot or describing what you see
4. Confirming it works before marking complete
