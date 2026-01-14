# GitClawd Layout Architecture

How the UI is organized, how panels relate, and responsive behavior.

---

## Core Principle: Diff-First

The diff viewer is the main value prop. Everything else supports it.

**Information hierarchy:**
1. **Diff content** - What changed (primary)
2. **File tree** - Which files changed (secondary)
3. **Commit details** - Who, when, why (context)
4. **Graph** - History shape (navigation)
5. **Claude** - Natural language interface (assistant)

---

## Layout Modes

### Mode 1: Standard (Graph + Diff + Claude)

The default three-column layout for exploring history.

```
+--------+------------------------+------------+
| HEADER (repo path, branch, actions)          |
+--------+------------------------+------------+
|        |                        |            |
| GRAPH  |    DIFF VIEWER         |  CLAUDE    |
|        |    +---------+         |            |
|        |    | Files   |         |            |
|        |    +---------+         |            |
|        |    | Content |         |            |
|        |    |         |         |            |
|        |    |         |         |            |
+--------+------------------------+------------+
```

**Grid definition:**
```css
.app-layout {
  display: grid;
  grid-template-rows: 56px 1fr;
  grid-template-columns: minmax(280px, 1fr) minmax(400px, 2fr) 380px;
  height: 100vh;
}

.header { grid-column: 1 / -1; }
.graph-panel { grid-column: 1; }
.diff-panel { grid-column: 2; }
.claude-panel { grid-column: 3; }
```

**Column behavior:**
- **Graph:** Minimum 280px, grows to 1fr. Shows commit history.
- **Diff:** Minimum 400px, grows to 2fr. The primary workspace.
- **Claude:** Fixed 380px. Chat interface.

### Mode 2: Focused Diff (No Graph)

When you're deep in code review, hide the graph.

```
+----------------------------------------+------------+
| HEADER                                              |
+-----------------+-----------------------+------------+
|                 |                       |            |
|   FILE TREE     |    DIFF CONTENT       |  CLAUDE    |
|                 |                       |            |
|   - file.js     |    @@ -1,5 +1,6 @@    |            |
|   - style.css   |    - old line         |            |
|   - index.html  |    + new line         |            |
|                 |                       |            |
+-----------------+-----------------------+------------+
```

```css
.app-layout.focused {
  grid-template-columns: 240px 1fr 380px;
}
```

### Mode 3: Working Changes

For staging and committing. Split between unstaged and staged.

```
+----------------------------------------------------+
| HEADER                                              |
+-----------------+----------------------------------+------------+
|  UNSTAGED       |  DIFF VIEWER                      |  CLAUDE   |
|                 |  (selected file's changes)        |           |
|  - file1.js     |                                   |           |
|  - file2.css    |                                   |  "Stage   |
+-----------------+                                   |  these    |
|  STAGED         |                                   |  changes" |
|                 |                                   |           |
|  - file3.ts     |                                   |           |
+-----------------+----------------------------------+------------+
```

### Mode 4: Claude Expanded

When Claude needs more space (explaining code, showing longer responses).

```
+----------------------------+------------------------+
| HEADER                                              |
+----------------------------+------------------------+
|                            |                        |
|    DIFF VIEWER             |       CLAUDE           |
|                            |       (expanded)       |
|                            |                        |
|                            |                        |
+----------------------------+------------------------+
```

```css
.app-layout.claude-expanded {
  grid-template-columns: 1fr 1fr;
}

.graph-panel.hidden { display: none; }
```

---

## Panel Specifications

### Header (56px fixed)

```
+-------------------------------------------------------------------+
| [logo]  [Open Repo]  /path/to/repo          [branch: main] [...]  |
+-------------------------------------------------------------------+
```

```css
.header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-5);
  gap: var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-semibold);
  font-size: var(--text-xl);
}

.header-repo-path {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-branch {
  padding: var(--space-1) var(--space-3);
  background: var(--accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: white;
}
```

### Graph Panel

```
+------------------+
| [Node] msg  abc1 |
| [Node] msg  abc2 |
| |                |
| [Node] msg  abc3 |
+------------------+
```

The graph uses a canvas renderer for performance with large repos.

```css
.graph-panel {
  background: var(--bg-base);
  overflow: auto;
  border-right: 1px solid var(--border-subtle);
}

.graph-commit-row {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  cursor: pointer;
}

.graph-commit-row:hover {
  background: var(--bg-raised);
}

.graph-commit-row.selected {
  background: var(--accent-bg);
}
```

**Graph config:**
- Node radius: 5px (6px when selected)
- Row height: 36px
- Lane width: 24px
- Lane colors: Use the lane color palette from design system

### Diff Panel

The diff panel has two parts: file tree and diff content.

```
+----------------------------------------+
| CHANGED FILES                   [view] |
+----------------------------------------+
|  M  src/index.js               +12 -3  |
|  A  src/new-file.ts            +45 -0  |
|  D  src/old-file.js            +0 -23  |
+----------------------------------------+
| diff --git a/src/index.js ...          |
| @@ -15,6 +15,8 @@                       |
|    context line                         |
| -  removed line                         |
| +  added line                           |
|    context line                         |
+----------------------------------------+
```

```css
.diff-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  overflow: hidden;
}

.diff-file-list {
  flex-shrink: 0;
  max-height: 200px;
  overflow-y: auto;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface);
}

.diff-file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.diff-file-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.diff-file-item:hover {
  background: var(--bg-raised);
}

.diff-file-item.selected {
  background: var(--accent-bg);
  border-left: 2px solid var(--accent);
}

.diff-file-status {
  width: 16px;
  text-align: center;
  font-weight: var(--font-semibold);
}

.diff-file-status.modified { color: var(--warning); }
.diff-file-status.added { color: var(--success); }
.diff-file-status.deleted { color: var(--error); }
.diff-file-status.renamed { color: var(--info); }

.diff-file-stats {
  margin-left: auto;
  font-size: var(--text-xs);
}

.diff-file-stats .add { color: var(--success); }
.diff-file-stats .del { color: var(--error); }

.diff-content {
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}
```

**View toggle:**
- Unified (default): All changes in single column
- Side-by-side: Old on left, new on right

### Claude Panel

```
+--------------------+
| [*] Claude         |
+--------------------+
|                    |
| [assistant msg]    |
|                    |
|     [user msg]     |
|                    |
| [tool: git_status] |
|                    |
| [assistant msg]    |
|                    |
+--------------------+
| [input........] [>]|
+--------------------+
```

```css
.claude-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-default);
}

.claude-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.claude-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.claude-input-area {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: var(--space-3);
}

.claude-input {
  flex: 1;
}
```

---

## Interactions

### Selecting a Commit

1. Click node in graph
2. Graph highlights selected node
3. Diff panel loads that commit's changes
4. File list shows changed files
5. First file's diff shown by default
6. Claude context updated (knows selected commit)

**Animation:** Diff content fades in (150ms)

### Selecting a File in Diff

1. Click file in file list
2. File highlights as selected
3. Diff content scrolls/switches to that file
4. If side-by-side, both sides update

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `j` / `k` | Next/previous commit |
| `n` / `p` | Next/previous file |
| `Enter` | Focus diff content |
| `Escape` | Unfocus, return to graph |
| `Cmd+K` | Open command palette (future) |
| `/` | Focus Claude input |

### Panel Resize

Allow drag-to-resize between panels:
- Graph ↔ Diff border
- Diff ↔ Claude border

```css
.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background var(--transition-fast);
}

.resize-handle:hover,
.resize-handle.active {
  background: var(--accent);
}
```

### Panel Collapse

Each side panel can be collapsed to maximize diff space:
- Graph → Collapse to 48px strip (just nodes, no text)
- Claude → Collapse to icon-only header

```css
.panel.collapsed {
  width: 48px;
  overflow: hidden;
}

.panel.collapsed .panel-content {
  display: none;
}
```

---

## Responsive Behavior

### Large screens (> 1280px)

Full three-column layout. All panels at comfortable widths.

### Medium screens (1024px - 1280px)

Narrower Claude panel (320px). Graph panel can be collapsed.

```css
@media (max-width: 1280px) {
  .app-layout {
    grid-template-columns: minmax(240px, 1fr) minmax(400px, 2fr) 320px;
  }
}
```

### Small screens (768px - 1024px)

Claude panel becomes a slide-out drawer. Two-column layout.

```css
@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: minmax(200px, 280px) 1fr;
  }

  .claude-panel {
    position: fixed;
    right: 0;
    top: 56px;
    bottom: 0;
    width: 380px;
    transform: translateX(100%);
    transition: transform var(--transition-slow);
    z-index: var(--z-overlay);
  }

  .claude-panel.open {
    transform: translateX(0);
  }
}
```

### Very small screens (< 768px)

Single panel mode. Tabs or swipe to switch between graph/diff/claude.

```css
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .panel {
    position: absolute;
    inset: 56px 0 0 0;
  }

  .panel:not(.active) {
    display: none;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-default);
  }
}
```

---

## Empty States

### No Repo Open

```
+----------------------------------------+
|                                        |
|            [ folder icon ]             |
|                                        |
|         No repository open             |
|                                        |
|        [ Open Repository ]             |
|                                        |
|     Or drop a folder here              |
|                                        |
+----------------------------------------+
```

Centered in the main area. Claude panel shows welcome message.

### No Commit Selected

```
+----------------------------------------+
|                                        |
|          [ cursor icon ]               |
|                                        |
|     Click a commit to see changes      |
|                                        |
+----------------------------------------+
```

Shown in diff panel when no commit is selected.

### No Changes

```
+----------------------------------------+
|                                        |
|          [ check icon ]                |
|                                        |
|        No changes in this commit       |
|                                        |
+----------------------------------------+
```

For merge commits or empty commits.

---

## Loading States

### Graph Loading

Show skeleton rows with pulsing animation while loading commits.

```css
.skeleton-row {
  height: 36px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
}

.skeleton-circle {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--bg-raised);
  animation: skeleton-pulse 1.5s infinite;
}

.skeleton-bar {
  height: 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-raised);
  animation: skeleton-pulse 1.5s infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Diff Loading

Simple centered spinner in diff content area.

### Claude Thinking

Status dot pulses yellow. Optional "Thinking..." text in message area.

---

## Z-Index Layers

```
Base content        z: 0
Sticky headers      z: 200
Panel resize handle z: 250
Claude drawer       z: 300
Modal overlay       z: 400
Modal content       z: 401
Toast/notifications z: 500
```

---

## Implementation Checklist

1. [ ] Set up base grid layout with CSS Grid
2. [ ] Implement header component
3. [ ] Build graph panel with canvas renderer
4. [ ] Build diff panel with file list + content
5. [ ] Build Claude panel with chat interface
6. [ ] Add panel resize handles
7. [ ] Add panel collapse/expand
8. [ ] Implement responsive breakpoints
9. [ ] Add empty states
10. [ ] Add loading states
11. [ ] Keyboard navigation
12. [ ] Mobile layout (if needed)

---

## File Structure Suggestion

```
web/
├── index.html
├── styles/
│   ├── variables.css    # Design tokens from DESIGN_SYSTEM.md
│   ├── base.css         # Reset, typography, scrollbars
│   ├── layout.css       # Grid, panels, responsive
│   └── components.css   # Buttons, inputs, badges, etc.
├── components/
│   ├── header.js
│   ├── graph.js
│   ├── diff.js
│   ├── claude.js
│   └── shared.js
└── server.js
```

Or keep as single index.html with styles inlined for simplicity during prototyping.
