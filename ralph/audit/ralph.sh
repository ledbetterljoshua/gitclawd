#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo ""
  echo "============================================"
  echo "Iteration $i of $1"
  echo "============================================"
  echo ""

  result=$(claude --dangerously-skip-permissions -p "@prompt.md @audit.json @progress.md

Do ONE of the following:
1. If there are items with passes: false, pick the FIRST one and complete it thoroughly
2. If all items pass, discover NEW items to build (check PRD.md for ideas)
3. If truly complete (all planned features built), output <promise>COMPLETE</promise>

Remember:
- Work on ONLY ONE item per invocation
- Be thorough - implement and test, don't just plan
- Update both audit.json AND progress.md
")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "============================================"
    echo "BUILD COMPLETE after $i iterations"
    echo "============================================"
    exit 0
  fi

  sleep 2
done

echo ""
echo "============================================"
echo "Reached max iterations ($1)"
echo "============================================"
