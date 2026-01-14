#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Running single build iteration..."
echo ""

claude --dangerously-skip-permissions -p "@prompt.md @audit.json @progress.md

Do ONE of the following:
1. If there are items with passes: false, pick the FIRST one and complete it thoroughly
2. If all items pass, discover NEW items to build (check PRD.md for ideas)
3. If truly complete (all planned features built), output <promise>COMPLETE</promise>

Remember:
- Work on ONLY ONE item per invocation
- Be thorough - implement and test, don't just plan
- Update both audit.json AND progress.md
"
