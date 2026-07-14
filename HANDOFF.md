# Handoff Protocol — tradingagents_DD

> When a task moves from one agent (or human) to another.

## When to Handoff

- Task completed → next agent takes over
- Task blocked → escalate to next available agent
- End of session → next session picks up from progress.md
- Subtask within a multi-session implementation

## Handoff Steps

### 1. Outgoing agent: Write progress.md entry

```markdown
## Handoff to [agent_name]

**Task:** [Phase X, Task Y — description]
**Status:** [in_progress / blocked / pending]
**File:** [exact path, e.g. `frontend/src/components/Panel.jsx`]
**Lines:** [relevant line numbers if known]

**What is done:**
- ...

**What must be done next:**
- ...

**Blockers:** [none / describe blocker]

**Key findings:**
- [any non-obvious decisions made]
```

### 2. Update dev log

Add to `.devlog/devlog-YYYY-MM.md`:

```markdown
### Hand-off: [Phase X, Task Y] → [next_agent]
- State at handoff: [brief description]
- Next step: [one sentence]
```

### 3. Incoming agent: Read before starting

1. Read `.devlog/devlog-YYYY-MM.md` for context
2. Read `progress.md` in the worktree
3. Read `findings.md` for decisions made
4. Resume from `progress.md` "What must be done next"

### 4. Verify state before starting

If a previous agent made file changes:
```bash
cd planning/worktree-<name>-<feature>
git status
git diff
```

Confirm the changes are as described in the handoff note before continuing.

## Hand-off Verification Checklist

- [ ] Outgoing agent wrote progress.md handoff note
- [ ] Dev log updated with hand-off entry
- [ ] Incoming agent read progress.md before starting
- [ ] Incoming agent ran `git status` to verify file state
- [ ] Incoming agent confirmed no blocker before starting work

## Cross-Phase Handoff

When a Phase is complete (e.g., Phase 1 Flask done):

1. Mark all tasks done in `task_plan.md`
2. Update `.devlog/devlog-YYYY-MM.md` with Phase completion entry
3. Create or update GitHub Issue for next Phase
4. Next agent picks up new Issue → new worktree

## Emergency Handoff

If a session ends unexpectedly (agent crashes, etc.):

1. Check `progress.md` in every active worktree
2. Check `.devlog/` for the most recent entry
3. The next agent resumes from the most recent `progress.md` "What must be done next"