# GitClawd Roadmap

*Owned by Product Claude. Last updated: Jan 14, 2026*

## Vision

A Git client where Claude is a first-class collaborator. Not buttons for everything - Claude IS the power interface.

---

## Phase 1: Foundation (Current)

**Goal:** Make GitClawd usable as a real Git client.

### 1.1 Claude Context Visibility ⬅️ NOW
Users need to see what Claude sees. When you select a commit, the Claude panel should acknowledge it.

**Tasks:**
- [ ] Show "Viewing commit abc123" in Claude panel header
- [ ] Show repo path and branch in Claude context
- [ ] When user clicks a diff line, offer "Ask about this line"

### 1.2 Write Operations via Claude
Claude already has Bash tools. We need the UI to reflect state changes.

**Tasks:**
- [ ] After Claude runs git commands, refresh the commit list
- [ ] Show "Claude ran: `git commit -m '...'`" in chat
- [ ] Add confirmation before destructive operations

### 1.3 Security Hardening
Fix the critical vulnerabilities before more users.

**Tasks:**
- [ ] Session-based repo state (not global)
- [ ] Validate commit hash format
- [ ] Validate repo paths (must be git repos)
- [ ] Add CORS configuration

### 1.4 Streaming Responses
Show Claude working instead of waiting for full response.

**Tasks:**
- [ ] Switch to streaming API
- [ ] Progressive text rendering in chat

---

## Phase 2: Native Feel

**Goal:** Claude integration feels like part of the app, not a sidebar.

### 2.1 Claude UI Control
Claude should be able to show its work visually.

**Ideas:**
- Claude can highlight commits while explaining
- Claude can scroll to specific files
- Claude can annotate diffs

### 2.2 Line-Level Interaction
Click a line, ask about it.

**Tasks:**
- [ ] Right-click line → "Ask Claude about this"
- [ ] Line selection → Claude knows which lines
- [ ] Inline Claude responses (not just in panel)

### 2.3 Conflict Resolution
The killer feature. Claude reads both sides, suggests resolution.

**Tasks:**
- [ ] Detect merge conflicts
- [ ] Show conflict UI
- [ ] Claude suggests resolution
- [ ] One-click apply

---

## Phase 3: Polish

**Goal:** Production-ready.

### 3.1 Testing
- Unit tests for diff parsing
- Integration tests for git operations
- E2E tests for core workflows

### 3.2 Performance
- Virtual scrolling for large repos
- Lazy loading for diffs
- Async git operations

### 3.3 Distribution
- Signed builds for Mac/Windows
- Auto-update
- One-click installer

---

## Not Building (Yet)

These were suggested but are lower priority:

- **Commit message generator button** - Just ask Claude
- **PR integration** - Later, after core is solid
- **Multi-repo tabs** - Later
- **Tauri migration** - Electron is fine for now

---

## Decisions Log

Major decisions that shaped this roadmap:

1. **Claude IS the interface** - We're not building buttons for every git operation. Claude can do it.
2. **Fix security before features** - Can't ship vulnerable code.
3. **Native feel > more features** - Better to do less, but have it feel integrated.

---

*Update this file when priorities change. All Claudes should check this before starting work.*
