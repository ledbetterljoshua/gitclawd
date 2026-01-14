# GitClawd Design System

A dark, focused design system for a Claude-native git client. Diffs are the core experience.

---

## Color System

### CSS Variables

```css
:root {
  /* === BACKGROUNDS === */
  --bg-void: #06060a;        /* Deepest background - behind everything */
  --bg-base: #0a0a0f;        /* Main app background */
  --bg-surface: #12121a;     /* Panels, cards, elevated surfaces */
  --bg-raised: #1a1a24;      /* Hover states, secondary surfaces */
  --bg-overlay: #22222e;     /* Dropdowns, tooltips, popovers */

  /* === BORDERS === */
  --border-subtle: #1e1e28;  /* Barely visible dividers */
  --border-default: #2a2a3a; /* Standard borders */
  --border-strong: #3a3a4a;  /* Emphasized borders, focus rings */

  /* === TEXT === */
  --text-primary: #e8e8f0;   /* Primary content */
  --text-secondary: #a0a0b0; /* Secondary content, labels */
  --text-muted: #6a6a7a;     /* Disabled, placeholders */
  --text-ghost: #4a4a5a;     /* Very subtle, timestamps */

  /* === ACCENT - Purple (Claude's color) === */
  --accent: #8b5cf6;         /* Primary actions, links */
  --accent-hover: #7c4ddb;   /* Hover state */
  --accent-muted: #6d4cc4;   /* Subtle accent uses */
  --accent-bg: rgba(139, 92, 246, 0.12); /* Accent backgrounds */

  /* === SEMANTIC COLORS === */
  --success: #22c55e;        /* Added lines, success states */
  --success-bg: rgba(34, 197, 94, 0.12);
  --warning: #eab308;        /* Warnings, modified, hashes */
  --warning-bg: rgba(234, 179, 8, 0.12);
  --error: #ef4444;          /* Deleted lines, errors */
  --error-bg: rgba(239, 68, 68, 0.12);
  --info: #3b82f6;           /* Info states, links */
  --info-bg: rgba(59, 130, 246, 0.12);

  /* === DIFF COLORS === */
  --diff-add-line: rgba(34, 197, 94, 0.15);
  --diff-add-word: rgba(34, 197, 94, 0.35);
  --diff-del-line: rgba(239, 68, 68, 0.15);
  --diff-del-word: rgba(239, 68, 68, 0.35);
  --diff-header: var(--accent);
  --diff-hunk: var(--text-muted);

  /* === GRAPH LANE COLORS === */
  --lane-1: #60a5fa;  /* Blue */
  --lane-2: #4ade80;  /* Green */
  --lane-3: #f59e0b;  /* Amber */
  --lane-4: #ef4444;  /* Red */
  --lane-5: #8b5cf6;  /* Purple */
  --lane-6: #06b6d4;  /* Cyan */
  --lane-7: #ec4899;  /* Pink */
  --lane-8: #84cc16;  /* Lime */
}
```

### Usage Guidelines

| Use Case | Variable |
|----------|----------|
| App background | `--bg-base` |
| Panels/sidebars | `--bg-surface` |
| Hover states | `--bg-raised` |
| Body text | `--text-primary` |
| Labels, captions | `--text-secondary` |
| Disabled text | `--text-muted` |
| Primary buttons | `--accent` |
| Success indicators | `--success` |
| Added code | `--success` + `--diff-add-line` |
| Deleted code | `--error` + `--diff-del-line` |

---

## Typography

### Font Stack

```css
:root {
  /* System UI for interface */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;

  /* Monospace for code and git data */
  --font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', Monaco, 'Consolas', monospace;
}
```

### Type Scale

```css
:root {
  /* Font sizes */
  --text-xs: 10px;    /* Timestamps, badges */
  --text-sm: 11px;    /* Secondary info, code */
  --text-base: 13px;  /* Body text, UI elements */
  --text-md: 14px;    /* Emphasized body */
  --text-lg: 16px;    /* Section headers */
  --text-xl: 18px;    /* Panel titles */
  --text-2xl: 24px;   /* Page headers */

  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Letter spacing */
  --tracking-tight: -0.01em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.05em;
}
```

### Typography Classes

```css
/* Headers */
.text-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.text-heading {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

/* Body text */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.text-secondary {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

/* Labels */
.text-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--text-muted);
}

/* Code/mono */
.text-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.text-hash {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--warning);
}
```

---

## Spacing System

### Scale

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Usage

| Context | Spacing |
|---------|---------|
| Inline elements gap | `--space-2` |
| Component internal padding | `--space-3` to `--space-4` |
| Panel padding | `--space-4` |
| Section gaps | `--space-6` |
| Major sections | `--space-8` or more |

---

## Border Radius

```css
:root {
  --radius-sm: 3px;   /* Badges, small elements */
  --radius-md: 6px;   /* Buttons, inputs */
  --radius-lg: 8px;   /* Cards, panels */
  --radius-xl: 12px;  /* Modals, large surfaces */
  --radius-full: 9999px; /* Pills, avatars */
}
```

---

## Shadows

```css
:root {
  /* Subtle elevation */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);

  /* Standard elevation */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);

  /* High elevation (modals, dropdowns) */
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

  /* Glow effects */
  --shadow-accent: 0 0 20px rgba(139, 92, 246, 0.3);
}
```

---

## Transitions

```css
:root {
  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 250ms ease;
  --transition-slower: 350ms ease;
}
```

### Standard transitions

```css
/* For hover states */
.interactive {
  transition: background var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);
}

/* For transforms */
.animated {
  transition: transform var(--transition-base),
              opacity var(--transition-base);
}
```

---

## Component Patterns

### Button - Primary

```html
<button class="btn btn-primary">Action</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: 1;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast),
              border-color var(--transition-fast);
}

.btn-primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Button - Secondary

```css
.btn-secondary {
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-overlay);
  border-color: var(--border-strong);
}
```

### Button - Ghost

```css
.btn-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-raised);
  color: var(--text-primary);
}
```

### Input

```html
<input type="text" class="input" placeholder="Enter value...">
```

```css
.input {
  width: 100%;
  padding: var(--space-3);
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--transition-fast);
}

.input::placeholder {
  color: var(--text-muted);
}

.input:hover {
  border-color: var(--border-strong);
}

.input:focus {
  border-color: var(--accent);
}

.input-mono {
  font-family: var(--font-mono);
}
```

### Panel

```html
<div class="panel">
  <div class="panel-header">Title</div>
  <div class="panel-content">Content here</div>
</div>
```

```css
.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--text-muted);
}

.panel-content {
  padding: var(--space-4);
}
```

### Badge / Tag

```html
<span class="badge">main</span>
<span class="badge badge-accent">HEAD</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.badge-accent {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.badge-success {
  background: var(--success-bg);
  border-color: var(--success);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-bg);
  border-color: var(--warning);
  color: var(--warning);
}

.badge-error {
  background: var(--error-bg);
  border-color: var(--error);
  color: var(--error);
}
```

### Status Indicator

```html
<span class="status status-active"></span>
<span class="status status-thinking"></span>
```

```css
.status {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--text-muted);
}

.status-active {
  background: var(--success);
}

.status-thinking {
  background: var(--warning);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### List Item (Selectable)

```css
.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.list-item:hover {
  background: var(--bg-raised);
}

.list-item.selected {
  background: var(--accent-bg);
}

.list-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
```

### Chat Message

```css
.message {
  max-width: 85%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.message-user {
  background: var(--accent);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: var(--radius-sm);
}

.message-assistant {
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  align-self: flex-start;
  border-bottom-left-radius: var(--radius-sm);
}

.message-tool {
  background: transparent;
  border: 1px dashed var(--border-default);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
}
```

---

## Diff Viewer Patterns

### Line styles

```css
.diff-line {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  white-space: pre;
}

.diff-line-number {
  display: inline-block;
  min-width: 48px;
  padding-right: var(--space-3);
  color: var(--text-ghost);
  text-align: right;
  user-select: none;
}

.diff-line-add {
  background: var(--diff-add-line);
  color: var(--success);
}

.diff-line-del {
  background: var(--diff-del-line);
  color: var(--error);
}

.diff-line-context {
  color: var(--text-secondary);
}

.diff-word-add {
  background: var(--diff-add-word);
  border-radius: 2px;
}

.diff-word-del {
  background: var(--diff-del-word);
  border-radius: 2px;
}

.diff-hunk-header {
  color: var(--diff-hunk);
  background: var(--bg-raised);
  padding: var(--space-2) var(--space-4);
  font-style: italic;
}

.diff-file-header {
  color: var(--accent);
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}
```

### Side-by-side diff

```css
.diff-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.diff-side {
  overflow-x: auto;
  border-right: 1px solid var(--border-subtle);
}

.diff-side:last-child {
  border-right: none;
}

.diff-side-header {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.diff-side-header.old {
  color: var(--error);
}

.diff-side-header.new {
  color: var(--success);
}
```

---

## Graph Patterns

### Node

```css
.graph-node {
  fill: currentColor;
  stroke: none;
  transition: r var(--transition-fast);
}

.graph-node-selected {
  fill: white;
  stroke: currentColor;
  stroke-width: 2px;
}

.graph-node:hover {
  filter: brightness(1.2);
}
```

### Edge

```css
.graph-edge {
  fill: none;
  stroke: currentColor;
  stroke-width: 2px;
  stroke-linecap: round;
}

.graph-edge-merge {
  stroke-dasharray: 4 2;
}
```

---

## Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}

::-webkit-scrollbar-corner {
  background: transparent;
}
```

---

## Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

---

## Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

Layouts should adapt at `--breakpoint-lg` (1024px) - the point where the full three-panel layout becomes cramped.

---

## Implementation Notes

1. **Dark mode is the only mode** - no light theme toggle needed
2. **Accent color is Claude's purple** - reinforces the Claude-native identity
3. **Monospace for all git data** - hashes, diffs, file paths, code
4. **Minimal border usage** - prefer background contrast for separation
5. **Animations should be subtle** - fast transitions, no bouncy effects
6. **Focus on readability** - diffs are dense, optimize for scanning

---

## Quick Reference

```css
/* Copy this block for any new component file */
:root {
  /* Backgrounds */
  --bg-void: #06060a;
  --bg-base: #0a0a0f;
  --bg-surface: #12121a;
  --bg-raised: #1a1a24;
  --bg-overlay: #22222e;

  /* Borders */
  --border-subtle: #1e1e28;
  --border-default: #2a2a3a;
  --border-strong: #3a3a4a;

  /* Text */
  --text-primary: #e8e8f0;
  --text-secondary: #a0a0b0;
  --text-muted: #6a6a7a;
  --text-ghost: #4a4a5a;

  /* Accent */
  --accent: #8b5cf6;
  --accent-hover: #7c4ddb;
  --accent-muted: #6d4cc4;
  --accent-bg: rgba(139, 92, 246, 0.12);

  /* Semantic */
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --info: #3b82f6;

  /* Fonts */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Monaco, monospace;

  /* Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 */
  /* Radius: 3, 6, 8, 12, 9999 */
  /* Transitions: 100ms, 150ms, 250ms, 350ms */
}
```
