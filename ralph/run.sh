#!/bin/bash

# GitClawd Ralph Runner
# Spawns Claude to work through checklist items one at a time

GITCLAWD_DIR="/Users/joshualedbetter/gitclawd"
RALPH_DIR="$GITCLAWD_DIR/ralph"

echo "🦞 GitClawd Ralph Runner"
echo "========================"
echo ""
echo "Current checklist item:"
echo ""
head -20 "$RALPH_DIR/CHECKLIST.md"
echo ""
echo "..."
echo ""
echo "========================"
echo ""

# Determine role from checklist (strip markdown bold markers)
ROLE=$(grep "Role:" "$RALPH_DIR/CHECKLIST.md" | head -1 | cut -d':' -f2 | sed 's/\*\*//g' | xargs)

if [ "$ROLE" = "Design Lead" ]; then
    PROMPT="
You are the Design Lead for GitClawd, a GitKraken clone with Claude at its heart.

## Your Role
You think holistically about the user experience. You establish the visual language,
layout architecture, and interaction patterns that implementation engineers will follow.

## IMPORTANT: Use the frontend-design skill
Run /frontend-design first to load the design skill. This will give you access to
design principles and patterns for creating distinctive, high-quality interfaces.

## Your Task
Read the CHECKLIST.md file at /Users/joshualedbetter/gitclawd/ralph/CHECKLIST.md
Complete the design work described there.

## Your Approach
1. Run /frontend-design to load the design skill
2. Understand the product vision (read DESIGN_BRIEF.md and PRD.md)
3. Look at the current implementation to understand what exists
4. Make opinionated design decisions - don't defer, decide
5. Create clear, specific documentation that engineers can follow
6. Think about the whole experience, not just individual screens

## Key Principles
- Diffs are the core experience (not the graph)
- Claude should feel native, not bolted on
- Dark mode primary
- Fast and responsive feel
- Modern but not trendy

## Output
Create design documentation in /Users/joshualedbetter/gitclawd/design/
Your output should be specific enough that another Claude can implement it consistently.

## Reference Files
- Design brief: /Users/joshualedbetter/gitclawd/ralph/DESIGN_BRIEF.md
- PRD: /Users/joshualedbetter/gitclawd/ralph/PRD.md
- Checklist: /Users/joshualedbetter/gitclawd/ralph/CHECKLIST.md
- Current app: /Users/joshualedbetter/gitclawd/web/

Start by running /frontend-design, then read the checklist and design brief.
"
else
    PROMPT="
You are working on GitClawd, a GitKraken clone with Claude at its heart.

## Your Task
Read the CHECKLIST.md file at /Users/joshualedbetter/gitclawd/ralph/CHECKLIST.md
Implement the current work item described there.

## Process
1. Read the checklist item requirements
2. Read the design system at /Users/joshualedbetter/gitclawd/design/ and follow it
3. Implement the feature in /Users/joshualedbetter/gitclawd/web/
4. Test it by using your browser tools to verify it works
5. Take a screenshot to confirm
6. Update CHECKLIST.md to mark item complete

## Important
- Follow the design system exactly
- The web server runs at http://localhost:3456
- Verify your work visually before marking complete
- Be thorough - this should actually work, not just compile

## Files
- Design system: /Users/joshualedbetter/gitclawd/design/
- PRD: /Users/joshualedbetter/gitclawd/ralph/PRD.md
- Checklist: /Users/joshualedbetter/gitclawd/ralph/CHECKLIST.md
- Web app: /Users/joshualedbetter/gitclawd/web/

Start by reading the checklist and implementing the current item.
"
fi

echo "Spawning Claude with role: ${ROLE:-Engineer}"
echo ""

# Run claude interactively with the prompt
claude --dangerously-skip-permissions -p "$PROMPT"
