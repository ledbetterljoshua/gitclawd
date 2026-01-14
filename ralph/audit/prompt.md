# GitClawd Build - Ralph Prompt

You are building GitClawd, a GitKraken clone with Claude at its heart.

## Project Overview
- **Web app** at `/Users/joshualedbetter/gitclawd/web/` running on http://localhost:3456
- **Design docs** go in `/Users/joshualedbetter/gitclawd/design/`
- **Core value prop**: Good diffs (not the graph)
- **Claude integration**: Uses custom MCP tools, not Bash

## Your Task

Look at `audit.json` and find the FIRST item with `passes: false`.

1. **Understand the item** - Read its description fully
2. **Do the work** - Implement the feature or create the design docs
3. **Verify it works** - Use browser tools to test at http://localhost:3456
4. **Update audit.json** - Set `passes: true`, add `audited_at` timestamp, add `finding` summary
5. **Update progress.md** - Add an entry documenting what you did

## Categories

- **design**: Use `/frontend-design` skill. Create opinionated design docs another Claude can follow.
- **feature**: Implement in `/Users/joshualedbetter/gitclawd/web/`. Test with browser tools.
- **polish**: Refinement work on existing features.

## Key Files

- Web server: `/Users/joshualedbetter/gitclawd/web/server.js`
- Frontend: `/Users/joshualedbetter/gitclawd/web/index.html`
- Design brief: `/Users/joshualedbetter/gitclawd/ralph/DESIGN_BRIEF.md`
- PRD: `/Users/joshualedbetter/gitclawd/ralph/PRD.md`

## Important Rules

1. Work on ONLY ONE item per invocation
2. Be thorough - actually implement and test, don't just plan
3. For design items, create concrete CSS variables and specific guidance
4. For feature items, verify visually with browser tools before marking complete
5. Update BOTH audit.json AND progress.md

## Completion

When all items pass and you've verified comprehensive coverage, output:
`<promise>COMPLETE</promise>`
