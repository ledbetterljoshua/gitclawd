# GitClawd Architecture Exploration

## The Core Insight

The Agent SDK gives us a "mini Claude" that can:
- Read files, run bash commands, search codebases
- Use custom MCP tools we define
- Maintain conversation context across interactions
- Spawn subagents for parallel work

**We don't bolt Claude onto a git UI. We build a git UI that Claude inhabits.**

---

## Architecture Options

### Option A: Electron + Agent SDK
```
┌─────────────────────────────────────────┐
│           Electron Main Process          │
│  ┌─────────────────────────────────────┐ │
│  │         Agent SDK Instance          │ │
│  │  - Git MCP Tools                    │ │
│  │  - UI Control MCP Tools             │ │
│  │  - Session Management               │ │
│  └─────────────────────────────────────┘ │
│                    ↕                     │
│  ┌─────────────────────────────────────┐ │
│  │       Electron Renderer (React)     │ │
│  │  - Commit Graph Visualization       │ │
│  │  - Diff Viewer                      │ │
│  │  - Claude Response Display          │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Pros:** Mature ecosystem, easy packaging, familiar dev experience
**Cons:** Heavy (Chromium), slower startup, memory hog

### Option B: Tauri + Agent SDK
```
┌─────────────────────────────────────────┐
│              Tauri Backend (Rust)        │
│  ┌─────────────────────────────────────┐ │
│  │    Node.js Sidecar (Agent SDK)      │ │
│  │  - Git MCP Tools                    │ │
│  │  - UI Control via IPC               │ │
│  └─────────────────────────────────────┘ │
│                    ↕                     │
│  ┌─────────────────────────────────────┐ │
│  │         WebView (React/Solid)       │ │
│  │  - Commit Graph (native rendering?) │ │
│  │  - Modern, fast UI                  │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Pros:** Tiny binary (~10MB vs ~150MB), fast, native feel
**Cons:** More complex architecture (Rust + Node sidecar), newer ecosystem

### Option C: Full Native (Swift/Rust) + Agent SDK Sidecar
- Native performance for graph rendering
- Agent SDK runs as separate process
- Most complex to build, best UX

---

## The Git Graph Question

This is actually the hardest part. GitKraken's graph is their moat.

**Options for graph rendering:**

1. **Canvas/WebGL** - What GitKraken likely uses
   - Smooth zooming/panning
   - Can handle huge repos
   - Complex to build well

2. **SVG** - Simpler
   - Easier to make interactive
   - Performance ceiling with large repos
   - Libraries exist (D3, etc.)

3. **React Flow / xyflow** - Modern option
   - Built for node-based UIs
   - Might need adaptation for git DAG
   - Good interactivity out of box

4. **Existing Libraries:**
   - `git-graph` npm package
   - `react-git-graph`
   - Most are basic, might need heavy customization

**Recommendation:** Start with SVG/D3 for MVP, plan for Canvas/WebGL for scale.

---

## MCP Tools for Git

This is where GitClawd becomes special. Claude gets custom tools:

```typescript
// Git State Tools
tool("GetRepoStatus", "Get full repo state", ...)
tool("GetCommitHistory", "Get commits with filters", ...)
tool("GetBranchList", "List all branches", ...)
tool("GetFileDiff", "Get diff for file/commit", ...)
tool("GetMergeConflicts", "List current conflicts", ...)

// Git Action Tools
tool("StageFiles", "Stage files for commit", ...)
tool("CreateCommit", "Create a commit", ...)
tool("CreateBranch", "Create new branch", ...)
tool("CheckoutBranch", "Switch branches", ...)
tool("MergeBranch", "Merge branch into current", ...)
tool("RebaseBranch", "Rebase branch", ...)
tool("CherryPick", "Cherry-pick commits", ...)
tool("ResolveConflict", "Resolve a merge conflict", ...)

// UI Control Tools
tool("HighlightCommit", "Highlight commit in graph", ...)
tool("ShowDiff", "Display diff in viewer", ...)
tool("FocusBranch", "Pan/zoom to branch", ...)
tool("ShowNotification", "Display message to user", ...)
tool("RequestConfirmation", "Ask user yes/no", ...)
```

**The magic:** Claude doesn't just run `git` commands blindly. It can:
1. Query the visual state ("what commit is selected?")
2. Update the visual state ("highlight these commits")
3. Ask for confirmation through the UI
4. Show its work visually as it operates

---

## Claude's Context

What does Claude "see" at any moment?

```typescript
interface GitClawdContext {
  // Currently open repo
  repoPath: string;
  currentBranch: string;

  // UI State
  selectedCommits: string[];  // SHAs
  selectedFiles: string[];
  visibleCommitRange: [string, string];  // What's on screen
  activeDiff: DiffState | null;

  // Repo State
  stagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
  stashList: StashEntry[];

  // Merge State
  isMerging: boolean;
  isRebasing: boolean;
  conflicts: ConflictInfo[];
}
```

This context gets injected into Claude's system prompt or available via tools.

---

## Interaction Patterns

### Pattern 1: Click-to-Claude
User clicks commit → Claude sees it → Claude offers contextual actions
"This commit touched 5 files in /auth. Want me to explain the changes?"

### Pattern 2: Chat-to-Action
User types "squash last 3 commits" → Claude runs the operation → UI updates

### Pattern 3: Ambient Intelligence
Claude notices you've been on a branch for 50 commits behind main
"Your branch is significantly behind. Want me to show what's changed in main?"

### Pattern 4: Conflict Resolution
Merge conflict appears → Claude immediately analyzes
"I can see the conflict. Upstream changed the function signature, you added a parameter. Here's my suggested resolution: [show merged code]"

---

## Open Questions

1. **Electron vs Tauri?**
   - Electron: Faster to ship, heavier
   - Tauri: Better UX, more complex setup

2. **Graph Library?**
   - Build custom with D3/Canvas?
   - Use existing library?
   - Start simple, optimize later?

3. **Pricing Model?**
   - Users bring their own API key?
   - GitClawd subscription includes API costs?
   - Freemium (basic git free, Claude features paid)?

4. **MVP Scope?**
   - Single repo only?
   - Which git operations first?
   - How much Claude integration initially?

---

## MVP Feature List (Proposed)

### Phase 1: The Graph
- [ ] Commit graph visualization (SVG/D3)
- [ ] Branch labels and colors
- [ ] Click to select commit
- [ ] Basic diff viewer
- [ ] Works with local repos

### Phase 2: Claude Integration
- [ ] Agent SDK embedded
- [ ] Basic MCP tools (status, log, diff)
- [ ] Chat interface
- [ ] Context awareness (knows selected commit)

### Phase 3: Core Git Operations
- [ ] Stage/unstage files (via Claude or UI)
- [ ] Commit (with Claude-generated messages)
- [ ] Branch create/switch/delete
- [ ] Merge with conflict resolution

### Phase 4: Advanced
- [ ] Rebase (interactive via Claude)
- [ ] Cherry-pick
- [ ] Stash management
- [ ] Remote operations (push/pull/fetch)
- [ ] PR integration (GitHub/GitLab)

---

## Spike Results (Jan 14, 2026)

### Graph Rendering ✓
- **Location:** `/spikes/graph/`
- **Tech:** Plain HTML + Canvas
- **Result:** Works. Renders commits, branches, shows fork/merge structure, click-to-select works.
- **Verified:** Visual comparison with `git log --graph` matches.
- **Next:** Need scrolling/panning for large repos, better merge commit handling.

### Agent SDK ✓
- **Location:** `/spikes/agent-sdk/`
- **Tech:** Node.js + `@anthropic-ai/claude-agent-sdk`
- **Result:** Works. Claude uses custom MCP tools correctly.
- **Verified:** Ran query, Claude used `mcp__git-tools__GetGitLog` (not Bash).
- **Cost:** ~$0.02 per simple query.

### Key Insight: MCP Tools vs Bash

Claude can do everything with Bash. But custom MCP tools give us:
1. **UI integration** - Tools can update the UI, highlight commits. Bash can't.
2. **Structured data** - Tools return JSON. Bash returns text to parse.
3. **Safety** - We control exactly what operations exist.
4. **Context awareness** - Tools can read UI state ("what's selected?").

**Decision:** Use both. Custom MCP tools for UI-integrated operations, Bash available for edge cases.

---

## Next Steps

1. **Decision:** Electron or Tauri?
2. **Scaffold:** Basic desktop app with graph + agent
3. **Iterate:** Add git operations one by one

