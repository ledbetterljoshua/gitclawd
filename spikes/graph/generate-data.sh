#!/bin/bash
# Generate git data JSON for the graph visualization

REPO_PATH="${1:-/Users/joshualedbetter/gitclawd/test-repos/complex-repo}"
OUTPUT_FILE="$(dirname "$0")/git-data.json"

cd "$REPO_PATH" || exit 1

git log --pretty=format:'%H|%P|%s|%an|%ad|%D' --all --date=iso --topo-order > "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE from $REPO_PATH"
echo "Commits: $(wc -l < "$OUTPUT_FILE")"
