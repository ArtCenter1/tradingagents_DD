# Architecture — tradingagents_DD

## System Overview

```
┌─────────────────────────────────────────────────────┐
│  TradingAgents CLI (upstream, unchanged)            │
│  python main.py --ticker AAPL                        │
│        ↓ writes                                     │
│  results/{ticker}/TradingAgentsStrategy_logs/       │
│  full_states_log_{date}.json                         │
└──────────────────┬────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  tradingagents_DD                                    │
│  ┌──────────────┐   ┌──────────────────────────────┐│
│  │ Phase 1 Flask │   │ Phase 2+ FastAPI + React     ││
│  │ python app.py│   │ /api/* REST + SSE            ││
│  └──────────────┘   └──────────────┬───────────────┘│
│                                    │                 │
│                    Frontend (React SPA)              │
│                    react-grid-layout panels          │
│                    TradingView Lightweight Charts     │
└─────────────────────────────────────────────────────┘
```

## Phase Architecture

### Phase 1 — Flask Instant MVP
- `phase1/app.py` — Flask routes, reads `shared/log_reader.py`
- `phase1/templates/*.html` — Jinja2 templates, Bootstrap 5 CDN
- Zero build step. Works in any Python 3.10+ environment.
- Use for: 5-minute demo, no-internet-required environments, debugging.

### Phase 2 — FastAPI Backend
- `backend/main.py` — FastAPI app, CORS, serves React static build
- `backend/api/routes.py` — REST endpoints + SSE stream
- `backend/services/log_reader.py` — thin wrapper on `shared/log_reader.py`
- Runs on `:8000`. Phase 1 Flask stays available on `:5000`.

### Phase 3+ — React SPA
- `frontend/` — Vite + React 18
- `react-grid-layout` — draggable/resizable panels
- `lucide-react` — `GripVertical` drag handle icons
- Served by FastAPI's static mount at `/`

## Data Flow

```
TradingAgents run → JSON log file
       ↓
log_reader.py reads file
       ↓
Flask (Phase 1) OR FastAPI (Phase 2) serves data
       ↓
React frontend renders panels
       ↓
SSE stream polls every 5s for new runs
```

## Directory Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `phase1/` | Instant deployable Flask app |
| `backend/` | FastAPI REST API + static file server |
| `frontend/` | React SPA with react-grid-layout |
| `shared/` | Code shared between phase1 and backend |
| `docs/` | Living documentation (API, schema, widget guide) |
| `.devlog/` | Developer log, weekly entries |

## Key Design Decisions

1. **No new schema** — Reads TradingAgents' existing JSON output exactly as-is.
2. **No modifications to upstream** — TradingAgents `git clone` stays vanilla.
3. **Shared log reader** — `shared/log_reader.py` imported by both Flask and FastAPI.
4. **Static-first frontend** — FastAPI mounts compiled React; no separate frontend server needed.