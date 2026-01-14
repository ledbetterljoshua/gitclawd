# GitClawd Product Requirements

*Owned by Product Claude. Last updated: Jan 14, 2026*

## What is GitClawd?

A Git client where Claude is a first-class collaborator.

**Not:** A Git GUI with a chat sidebar.
**Yes:** A collaborative interface where Claude and the user share control.

## Core Principle

> Claude already has tools. Don't build buttons - let Claude do it.

When a user asks Claude to commit, Claude runs `git commit`. When they ask to resolve a conflict, Claude reads both sides and suggests. The UI reflects what Claude does.

## Target Users

**Primary:** Developers onboarding to complex codebases
- Need to understand years of history
- Currently: `git log`, `git blame`, asking teammates
- Pain: Knowledge lives in commits, not heads

**Secondary:** Developers doing code review
- Need context on changes
- Currently: GitHub UI, manual reading
- Pain: Missing implicit knowledge

## Core User Stories

### Understanding Code

> "I joined a project with 3 years of history. I want to understand why the auth system looks the way it does."

1. User opens repo
2. Asks Claude: "Walk me through the auth system's evolution"
3. Claude queries git history, identifies relevant commits
4. **Claude highlights commits in the graph as it explains**
5. User understands the journey, not just the destination

### Making Changes

> "I want to commit my changes with a good message."

1. User makes changes
2. Asks Claude: "Commit these changes"
3. Claude runs `git diff`, understands changes
4. Claude runs `git commit -m "..."` with appropriate message
5. **UI refreshes to show new commit**
6. User didn't have to write the message or think about staging

### Resolving Conflicts

> "I have merge conflicts and I don't understand both sides."

1. User attempts merge, conflicts appear
2. Claude automatically detects: "I see conflicts in 3 files"
3. For each conflict, Claude shows both sides and explains intent
4. Claude suggests resolution
5. User approves or tweaks
6. Claude applies resolution

## What Claude Needs

### Current Tools (via Agent SDK)
- GetGitLog - commit history
- GetGitStatus - repo state
- GetFileDiff - file changes
- GetSelectedCommit - UI state
- GetBranches - branch list
- Read, Glob, Grep - file access
- Bash - any command

### Needed: UI Control Tools
- HighlightCommits - show work visually
- ScrollToFile - navigate for user
- ShowNotification - communicate status
- RefreshUI - after state changes

### Needed: Context Awareness
- Know which commit is selected
- Know which file/line user is looking at
- Know if there are conflicts
- Know working tree state

## UX Requirements

### Claude Panel

**Must show:**
- Current context (repo, branch, selected commit)
- What Claude is doing ("Running git log...")
- Claude's responses with streaming

**Must allow:**
- Asking freeform questions
- Clicking suggested actions
- Referencing specific lines/files

### State Synchronization

When Claude runs a git command:
1. Command appears in chat: "Running: git commit -m '...'"
2. Result appears: "Created commit abc123"
3. UI refreshes automatically
4. No manual refresh needed

### Confirmation for Destructive Actions

Before Claude runs:
- `git reset --hard`
- `git push --force`
- `git branch -D`

Show confirmation: "Claude wants to force push. Allow?"

## Success Metrics

1. **Time to understand** - How long to grok a new codebase?
2. **Commits per session** - Are people actually using Claude to commit?
3. **Conflict resolution rate** - Do people use Claude for conflicts?
4. **Return usage** - Do people come back?

## What We're Not Building

- **Every git operation as a button** - Claude can do it
- **Git hosting** - Use GitHub/GitLab
- **Code editing** - Use your IDE
- **Team features** - Solo first, team later

---

*This is a living document. Update when requirements change.*
