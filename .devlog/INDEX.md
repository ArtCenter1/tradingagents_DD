# Dev Log Index

> All development activity is logged here. Every Phase, Task, Decision, and Blocker gets an entry.

## Current Sprint

- **Phase 1:** Flask Instant MVP (in progress)
- **Owner:** Vincent + Hermes

## Monthly Logs

| Month | Link | Status |
|-------|------|--------|
| 2026-07 | [devlog-2026-07.md](./devlog-2026-07.md) | Active |

## How to Write a Dev Log Entry

Every week, add a new `### Week NN` section to the current month's log:

```markdown
### Week 28 (07/07–07/13)
- **[Phase X, Task Y]**: What was done. Link to PR or findings file.
- **Decision**: Why approach A over B.
- **Blocker**: What stalled, and how it was resolved.
- **Hand-off**: Agent → Agent notes if task passed to another worker.
```

## Decision Log (Cross-cutting)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-13 | Flask Phase 1 before FastAPI | Zero build step — operators see results in 5 min, not 2h |
| 2026-07-13 | react-grid-layout over alternatives | Mature, layout serialization, responsive breakpoints, draggableHandle out of box |
| 2026-07-13 | Read-only JSON log integration | Zero modifications to TradingAgents upstream; auto-compatible with all future updates |

## Hand-off Protocol

When a task moves from one agent to another:

1. **Outgoing agent** writes a hand-off note in `progress.md`:
   ```markdown
   ### Handoff to [next_agent_name]
   - State: Phase 3, Task 3.4 in progress
   - File: frontend/src/components/Panel.jsx (lines 14-38)
   - Blocker: None
   - Next step: Wire up draggableHandle, then test panel drag
   ```
2. **Incoming agent** reads `progress.md` before starting
3. **Both** update the dev log entry for that task