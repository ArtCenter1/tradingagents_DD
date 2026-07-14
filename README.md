# tradingagents_DD

> **Companion Web UI for TradingAgents** — TradingView-style drag-and-drop dashboard.

**NOT a fork of TradingAgents.** Zero modifications to the upstream. Reads existing JSON log output files.

## Quick Start

### Phase 1 — Instant (no build, ~5 min)

```bash
cd phase1
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

Shows: run selector, analyst reports, trading decision. Works immediately.

### Phase 2 — FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
# → http://localhost:8000
```

## Project Structure

```
tradingagents_DD/
├── phase1/              # Flask instant MVP (no build step)
│   ├── app.py
│   ├── requirements.txt
│   ├── log_reader.py
│   └── templates/
├── backend/             # FastAPI backend
│   ├── main.py
│   ├── api/routes.py
│   ├── services/log_reader.py
│   └── requirements.txt
├── frontend/            # React SPA (Vite, optional)
├── shared/              # Shared code (log_reader logic)
├── docs/                # Living documentation
│   ├── architecture.md
│   ├── api.md
│   ├── run-report-schema.md
│   └── ui-widget-guide.md
├── .devlog/             # Developer logs (monthly)
│   ├── INDEX.md
│   └── devlog-YYYY-MM.md
├── DESIGN.md            # Design tokens + component specs
├── README.md
└── CHANGELOG.md
```

## Workflow

Uses Hybrid Human-Agent Workflow (see `.devlog/` for active entries):

1. **Pick a task** from GitHub Issues (labeled `ready`)
2. **Create worktree**: `git worktree add planning/worktree-<owner>-<feature> feat/xxx`
3. **Implement** with planning files: `task_plan.md`, `findings.md`, `progress.md`
4. **Open PR** when done
5. **Human reviews ALL PRs** before merge

## Tech Stack

| Layer | Technology |
|-------|------------|
| Phase 1 | Python Flask + Jinja2 + Bootstrap 5 CDN |
| Backend | FastAPI + uvicorn + sse-starlette |
| Frontend | React 18 + Vite + react-grid-layout |
| Charts | TradingView Lightweight Charts + ECharts |
| Icons | lucide-react (GripVertical drag handles) |

## Data Source

Reads directly from TradingAgents output logs:

```
# Point RESULTS_DIR to your TradingAgents/results directory:
# Default: ../TradingAgents/results (sibling directory)
RESULTS_DIR=D:/path/to/TradingAgents/results
```

Each run writes to:
```
results/{ticker}/TradingAgentsStrategy_logs/full_states_log_{date}.json
```

## License

MIT — Same as TradingAgents upstream.