# GitClawd Design Brief

## The Challenge
Design a git client that feels modern, focused, and Claude-native. Not a GitKraken clone with AI bolted on - something where Claude feels like it belongs.

## Core Screens/States

### 1. Empty State
- No repo open yet
- Should invite you to open one
- Maybe show recent repos?

### 2. Main View (Repo Open)
Need to show simultaneously:
- **Commit graph** - the history visualization
- **Diff viewer** - what changed (THE MAIN THING)
- **Claude panel** - chat/assistant
- **File tree** - which files changed
- **Commit details** - metadata about selected commit

How do these relate? What's primary vs secondary?

### 3. Working Changes View
- Unstaged changes
- Staged changes
- Preparing a commit

## Key Interactions

### Selecting a Commit
- Click in graph → what happens?
- Does diff viewer slide in? Expand? Replace something?
- How prominent is the transition?

### Asking Claude
- Is Claude always visible or summoned?
- How does Claude reference what you're looking at?
- Can Claude highlight things in the UI?

### Viewing a Diff
- Unified vs side-by-side?
- How to navigate between files?
- Syntax highlighting approach?
- How to handle large diffs?

## Design Constraints

### Technical
- Web-based (HTML/CSS/JS)
- Will run in Electron eventually
- Needs to handle repos with 1000s of commits
- Should work on different screen sizes (laptop to large monitor)

### Philosophical
- Claude is a first-class citizen, not a chatbot sidebar
- Diffs are the core experience (not the graph)
- Should feel fast and responsive
- Dark mode primary (devs live in dark mode)

## Inspiration
- GitKraken - good graph, bit cluttered
- GitHub Desktop - clean but limited
- VS Code's git integration - good diffs
- Linear - beautiful modern UI
- Raycast - command-palette thinking

## Deliverables

### 1. Design System
- Color palette (dark mode)
- Typography scale
- Spacing system
- Component patterns (buttons, inputs, panels, etc.)

### 2. Layout Architecture
- How screens are organized
- Panel relationships
- Responsive behavior

### 3. Interaction Patterns
- Click, hover, select behaviors
- Transitions and animations
- Focus states

### 4. Key Screen Designs
- Main view with diff visible
- Claude interaction in context
- Working changes view

## Output Format
Create a DESIGN_SYSTEM.md file with:
- CSS variables for the design tokens
- Component HTML/CSS patterns
- Layout structure
- Interaction notes

This will be the source of truth for all implementation Claudes.
