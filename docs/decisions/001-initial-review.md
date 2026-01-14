# Decision 001: Initial Product Review

*Date: Jan 14, 2026*

## What Happened

Spawned 5 Claude agents to review GitClawd from different perspectives:
- Engineer
- Designer
- Product Manager
- User
- CEO/Investor

## Key Findings

### Universal Agreement

1. **Claude feels bolted on** - Chat sidebar, not native integration
2. **No 10x moment** - Vision is good, execution doesn't deliver it yet
3. **Write operations are table stakes** - Can't be a Git client without commit
4. **Security issues exist** - Global state, path traversal, no validation

### The Insight That Changed Everything

Joshua's response to the feedback:

> "The whole point was to use the Claude Agent SDK to allow Claude to use Bash tools... we don't need a 'commit message generator' button, we just need people to talk to Claude."

This reframed the product:
- **Not:** Git GUI + AI features
- **Yes:** Claude as the interface, with visual feedback

### Priority Stack (Post-Discussion)

1. Make Claude's context visible to users
2. Make UI reflect Claude's actions (state sync)
3. Fix security issues
4. Streaming responses
5. Claude UI control (highlight commits, etc.)
6. Conflict resolution

### What We're NOT Building

- Buttons for every git operation
- Commit message generator (just ask Claude)
- Feature parity with GitKraken

## Decisions Made

1. **Claude IS the interface** - Power users talk to Claude, buttons are conveniences
2. **Fix security before features** - Can't ship vulnerable code
3. **Native feel > more features** - Better to do less but feel integrated

## Artifacts Created

- `/docs/ROADMAP.md` - Prioritized feature list
- `/docs/PRD.md` - Product requirements
- `/.claude/CLAUDE.md` - Shared context for all Claudes
- `/.claude/agents/` - Agent prompts for each role

## Open Questions

- How should Claude signal state changes? (auto-refresh?)
- How do we handle Claude mistakes? (undo? confirmation?)
- When should we ask for confirmation vs just do it?
