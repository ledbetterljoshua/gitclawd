# GitClawd Build Progress

## Summary
- **Started:** 2026-01-14
- **Items Discovered:** 5
- **Items Completed:** 3
- **Items Pending:** 2

---

## Build Log

### 2026-01-14 - Design System & Layout Architecture

**Item:** `design-system`
**Status:** Completed

**What was done:**

1. Created `/Users/joshualedbetter/gitclawd/design/DESIGN_SYSTEM.md`:
   - **Color system:** Dark theme with void/base/surface/raised/overlay backgrounds, subtle/default/strong borders, primary/secondary/muted/ghost text colors, purple accent (Claude's color), semantic colors for success/warning/error/info, diff-specific colors for add/del lines
   - **Typography:** System font stack for UI, monospace for code/git data, 7-step type scale (10-24px), line heights, font weights, letter spacing
   - **Spacing:** 10-step scale from 4px to 64px
   - **Border radius:** 5-step scale from 3px to pill
   - **Shadows:** sm/md/lg elevations plus accent glow
   - **Transitions:** fast/base/slow/slower timing
   - **Component patterns:** Buttons (primary/secondary/ghost), inputs, panels, badges, status indicators, list items, chat messages, diff viewer styles, graph patterns, scrollbar styling
   - **Z-index scale:** 6 layers from base to toast

2. Created `/Users/joshualedbetter/gitclawd/design/LAYOUT.md`:
   - **Core principle:** Diff-first hierarchy (diff > file tree > commit details > graph > claude)
   - **Layout modes:** Standard (3-column), Focused Diff (no graph), Working Changes, Claude Expanded
   - **Panel specs:** Header (56px), Graph panel, Diff panel (file list + content), Claude panel
   - **Interactions:** Commit selection flow, file selection, keyboard navigation (j/k/n/p/Enter/Escape//)
   - **Panel behaviors:** Resize handles, collapse/expand
   - **Responsive breakpoints:** Large (>1280), Medium (1024-1280), Small (768-1024), Very small (<768)
   - **Empty states:** No repo, no commit selected, no changes
   - **Loading states:** Skeleton rows, spinners, thinking indicator

**Files created:**
- `/Users/joshualedbetter/gitclawd/design/DESIGN_SYSTEM.md`
- `/Users/joshualedbetter/gitclawd/design/LAYOUT.md`

---

### 2026-01-14 - Proper Diff Viewer

**Item:** `diff-viewer`
**Status:** Completed

**What was done:**

Enhanced the diff viewer in `/Users/joshualedbetter/gitclawd/web/index.html` with the following features:

1. **Syntax Highlighting:**
   - Added highlight.js from CDN (v11.9.0 with github-dark theme)
   - Implemented `getLanguageFromPath()` function mapping 40+ file extensions to highlight.js language identifiers
   - Applied syntax highlighting to context lines and single add/del lines
   - Added language detection badge in file headers showing detected language

2. **Word-Level Diff:**
   - Implemented `computeWordDiff()` using LCS (Longest Common Subsequence) algorithm
   - Tokenizes lines by word boundaries and whitespace
   - Highlights specific changed words with `diff-word-add` and `diff-word-del` CSS classes
   - Applied to adjacent del/add line pairs in both unified and split views

3. **Unified View Enhancements:**
   - Dual line number columns (old line / new line)
   - Proper handling of del/add pairs for word-level highlighting
   - Hunk headers with context info
   - File section headers with status badge and language indicator

4. **Split/Side-by-Side View:**
   - Synchronized line pairing between old and new sides
   - Empty placeholder lines with subtle striped background for unpaired lines
   - Word-level diff highlighting in paired del/add lines
   - Improved file headers showing actual file paths

5. **Styling:**
   - Added `.diff-file-lang` badge styling
   - Added `.diff-side .diff-line.empty` styling with diagonal stripes
   - Added highlight.js overrides for proper coloring in add/del contexts
   - Syntax highlighting colors adjusted for add (green tint) and del (red tint) lines

**Files modified:**
- `/Users/joshualedbetter/gitclawd/web/index.html` - Added highlight.js, implemented syntax highlighting, word-level diff, improved unified/split views

**Verified:**
- Tested in browser using dev-browser automation
- Opened real git repository (ai-retry) with commit history
- Verified unified view, split view, file selection, syntax highlighting for YAML and JSON
- Confirmed word-level diff highlighting works on modified lines

---

### 2026-01-14 - File Tree in Diff Panel

**Item:** `file-tree`
**Status:** Completed

**What was done:**

Added a hierarchical file tree view to the diff panel, with toggle between flat list and tree views.

1. **View Toggle Controls:**
   - Added toggle button group (≡ for list, ▼ for tree) next to the existing Unified/Split toggle
   - New CSS styles for `.diff-tree-toggle` button group
   - State variable `fileListMode` tracks current view ('list' or 'tree')

2. **Tree Data Structure:**
   - Implemented `buildFileTree()` function that converts flat file list to nested tree structure
   - Groups files by directory path, creating nodes for each directory level
   - Each node contains: name, path, children (subdirectories), and files

3. **Tree Rendering:**
   - Implemented `renderTreeNode()` recursive function to render tree as HTML
   - Directory nodes with expand/collapse arrow icon (▼ rotates to ► when collapsed)
   - File count badges on each directory showing total files within
   - Proper indentation based on nesting depth (16px per level)
   - Files show only filename (not full path) with status badge

4. **Tree Interactions:**
   - Click directory to expand/collapse - toggled via `collapsedDirs` Set
   - Smooth CSS transition on collapse/expand (max-height + transform)
   - Click file to select and scroll diff viewer to that file's section
   - Selection state preserved across view mode switches

5. **Styling:**
   - `.diff-tree-node` - tree node container
   - `.diff-tree-dir` - directory row with hover effect
   - `.diff-tree-dir-icon` - expand/collapse arrow with rotation transition
   - `.diff-tree-dir-name` - directory name styling
   - `.diff-tree-dir-count` - file count badge
   - `.diff-tree-children` - collapsible children container
   - `.diff-file-item.tree-item` - file items with tree-specific padding

**Files modified:**
- `/Users/joshualedbetter/gitclawd/web/index.html` - Added tree view CSS, toggle buttons, buildFileTree(), renderTreeNode(), countFilesInDir(), updated renderFileList() for dual mode

**Verified:**
- Tested in browser using dev-browser automation
- Opened ai-retry repository with nested directory structure (src/internal/, src/retryables/)
- Verified tree view shows proper hierarchy with directories and files
- Tested directory collapse/expand functionality
- Confirmed file click navigates to correct diff section
- Verified toggle between list and tree views works correctly
- Both views maintain file selection and status badges

---

<!-- Entries added by each iteration -->
