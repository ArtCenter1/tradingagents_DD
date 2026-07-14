# Onboarding — tradingagents_DD

Welcome. This document explains how to start working on tradingagents_DD as a human or agent collaborator.

## What Is This Project?

tradingagents_DD is a **companion Web UI** for Tauric Research's [TradingAgents](https://github.com/TauricResearch/TradingAgents) framework. It reads TradingAgents' existing JSON log output and presents it as a TradingView-style drag-and-drop dashboard.

**Critical:** We do NOT modify TradingAgents. Zero changes to the upstream. We read output files only.

## Project Location

```
D:/My Projects/tradingagents_DD/
```

Sibling to TradingAgents:
```
D:/My Projects/TradingAgents/    ← upstream, unchanged
D:/My Projects/tradingagents_DD/ ← this project
```

## Three Governing Principles

1. **Upstream compatibility** — TradingAgents stays vanilla. Every future update is auto-compatible.
2. **Early operational version** — Phase 1 Flask ships before Phase 2 FastAPI before Phase 3 React.
3. **Live docs + dev log** — Fixed location, structured format, updated every Phase.

## Workflow: Hybrid Human-Agent (Issue-First)

### Step 1 — Pick a task
Find an open GitHub Issue labeled `ready`. Assign yourself.

### Step 2 — Create a worktree
```bash
git worktree add planning/worktree-<your-name>-<feature> feat/<feature-name>
cd planning/worktree-<your-name>-<feature>
```

### Step 3 — Implement
Use the 3-file planning system:
- `task_plan.md` — phases and status
- `findings.md` — research, decisions, errors
- `progress.md` — session log, test results, hand-offs

### Step 4 — Open PR
When done, open a PR against `main`. Human reviews ALL PRs.

### Step 5 — Handoff (if needed)
If another agent takes over:
1. Write a hand-off note in `progress.md`
2. The incoming agent reads it before starting
3. Both update the dev log

## Directory Map

| Directory | What |
|-----------|------|
| `phase1/` | Flask app — runs with `python app.py` |
| `backend/` | FastAPI app — runs with `uvicorn` |
| `frontend/` | React SPA — Vite build |
| `shared/` | `log_reader.py` — shared by phase1 and backend |
| `docs/` | Living docs: API, schema, widget guide, architecture |
| `.devlog/` | Dev logs: INDEX.md + monthly logs |

## Quick Start

### Test Phase 1 (Flask MVP)
```bash
cd D:/My Projects/tradingagents_DD/phase1
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

### Test Backend (FastAPI)
```bash
cd D:/My Projects/tradingagents_DD/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

### Frontend (React)
```bash
cd D:/My Projects/tradingagents_DD/frontend
npm install
npm run dev
# → http://localhost:5173
```

## Key Files to Read First

1. `README.md` — project overview, quick start, structure
2. `DESIGN.md` — design tokens, colors, component specs
3. `docs/run-report-schema.md` — every field in the JSON we read
4. `docs/ui-widget-guide.md` — what each panel shows
5. `.devlog/devlog-2026-07.md` — what has been done so far

## Important Conventions

- **RESULTS_DIR** — point this to your `TradingAgents/results/` directory:
  ```bash
  export RESULTS_DIR=D:/My\ Projects/TradingAgents/results
  ```
  or on Windows PowerShell:
  ```powershell
  $env:RESULTS_DIR = "D:\My Projects\TradingAgents\results"
  ```

- **Phase 1 is always available** — even after Phase 2+ ship, `python app.py` on port 5000 works for quick debugging.

- **Shared code lives in `shared/`** — `log_reader.py` is the single source of truth for reading logs. Never duplicate this logic.

- **Dev log format** — every week, add a `### Week NN` section to `.devlog/devlog-YYYY-MM.md`. Format: `[Phase, Task]`, Decision, Blocker, Hand-off.

## Who Owns What

| Owner | Area |
|-------|------|
| Vincent | Final review, PR approval, design decisions |
| Hermes (primary) | Phase 1 Flask, Backend API, Docs |
| Claude Code / others | Phase 3 React SPA, Charts |

## Getting Help

- Read `.devlog/INDEX.md` → current sprint status
- Read `.devlog/devlog-YYYY-MM.md` → recent decisions
- Read `docs/` → API, schema, widget guide
- Ask in PR comments or update `findings.md`