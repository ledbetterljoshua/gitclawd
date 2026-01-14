# Current Work Item

## Item: Design System & Layout Architecture
**Priority:** P0 (Foundation)
**Status:** Not Started
**Role:** Design Lead

### Context
Before building features, we need a coherent design foundation. This work sets the stage for everything else.

### Requirements

#### 1. Design System
Create `/Users/joshualedbetter/gitclawd/design/DESIGN_SYSTEM.md` containing:
- **Color palette** - Dark mode primary, semantic colors (success, error, warning, accent)
- **Typography** - Font stack, size scale, weights
- **Spacing** - Consistent spacing scale (4px base?)
- **Shadows/Borders** - How depth is communicated
- **Component patterns** - Buttons, inputs, panels, badges, etc.

#### 2. Layout Architecture
Define how the main view is organized:
- What are the major regions?
- How do they relate (fixed, flexible, collapsible)?
- What's the hierarchy of importance?
- How does it adapt to different viewport sizes?

#### 3. Interaction Patterns
Document key interactions:
- Selection states (commit selected, file selected)
- Hover behaviors
- Transitions/animations
- Focus management

#### 4. Key Decisions
Answer these questions:
- Where does the diff viewer live? (main content area? sliding panel? modal?)
- Is Claude always visible or summoned?
- How prominent is the graph vs the diff?
- Side-by-side or unified diff default?

### Deliverables
1. `/Users/joshualedbetter/gitclawd/design/DESIGN_SYSTEM.md` - Design tokens and patterns
2. `/Users/joshualedbetter/gitclawd/design/LAYOUT.md` - Layout architecture with ASCII/diagrams
3. `/Users/joshualedbetter/gitclawd/design/INTERACTIONS.md` - Interaction documentation

### Approach
1. Read the DESIGN_BRIEF.md for context
2. Look at the current implementation to understand what exists
3. Think holistically about the experience
4. Create the design system documentation
5. The output should be specific enough that implementation Claudes can follow it

### Verification
- Design system has concrete CSS variables
- Layout is clearly documented with visual diagrams
- Another Claude could read these docs and implement consistently
- Decisions are made, not deferred

### Reference
- Current app: http://localhost:3456
- Design brief: /Users/joshualedbetter/gitclawd/ralph/DESIGN_BRIEF.md
- PRD: /Users/joshualedbetter/gitclawd/ralph/PRD.md
