# tradingagents_DD — Phase 2 & 3 Implementation Plan

Implement the **FastAPI backend** (Phase 2) and **React SPA** (Phase 3) to deliver a full
TradingView-style drag-and-drop dashboard on top of the existing `shared/log_reader.py` library.

> Phase 1 (Flask) is **complete and verified**. Do NOT touch `phase1/` unless fixing a defect.
> Do NOT modify anything inside `../TradingAgents/`. Read-only access only.

---

## Context

| Item | Detail |
|------|--------|
| Repo root | `d:/My_Projects/tradingagents_DD/` |
| Shared library | `shared/log_reader.py` — `list_runs()`, `list_tickers()`, `load_run()`, `get_results_dir()` |
| Data location (default) | `results/{ticker}/TradingAgentsStrategy_logs/full_states_log_{date}.json` |
| Sample data | `results/AAPL/TradingAgentsStrategy_logs/full_states_log_2024-05-01.json` |
| Design system | `DESIGN.md` — cyan accent `#22d3ee`, deep slate bg, JetBrains Mono |
| API contract | `docs/api.md` |
| Widget guide | `docs/ui-widget-guide.md` |
| JSON schema | `docs/run-report-schema.md` |

---

## Governing Principles (from ONBOARD.md)

1. **Upstream compatibility** — Zero changes to `../TradingAgents/`.
2. **Early operational** — FastAPI ships before React; React mounts via FastAPI static.
3. **Shared code** — `shared/log_reader.py` is the **sole** source for reading logs. Never duplicate.

---

## Defaults (pre-approved)

1. **Python env** — use bare `python` command (resolves to pythoncore-3.13-64 on this machine).
2. **SSE polling interval** — 5 seconds (as per `docs/api.md`).
3. **CORS** — `allow_origins=["*"]` for dev.
4. **Layout persistence** — panel positions saved to `localStorage` via react-grid-layout.

---

## Proposed Changes

### Phase 2 — FastAPI Backend

---

#### [NEW] `backend/requirements.txt`

```
fastapi>=0.115.0
uvicorn>=0.32.0
sse-starlette>=2.1.0
```

---

#### [NEW] `backend/__init__.py`

Empty file — makes `backend` a Python package.

---

#### [NEW] `backend/main.py`

FastAPI application entry point.

- `create_app()` factory function
- CORS middleware — `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`
- Include router from `backend/api/routes.py` with prefix `/api`
- Mount `frontend/dist` as static files at `/` (served after React build)
- Catch-all route: serve `frontend/dist/index.html` for any non-API path (SPA fallback)

```python
# Sketch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(title="tradingagents_DD API", version="2.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
    app.include_router(router, prefix="/api")
    # Mount static only if dist exists (avoids error before first build)
    if Path("frontend/dist").exists():
        app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
    return app

app = create_app()
```

Run command: `uvicorn backend.main:app --reload --port 8000`

---

#### [NEW] `backend/api/__init__.py`

Empty file.

---

#### [NEW] `backend/api/routes.py`

All REST + SSE endpoints as defined in `docs/api.md`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/runs` | GET | List all runs. Optional `?ticker=` query param. Returns `[{ticker, date, path}]` |
| `/api/run/{ticker}/{date}` | GET | Load single run's full state JSON. Returns full state object. |
| `/api/tickers` | GET | List all ticker symbols. Returns `["AAPL", "MSFT", ...]` |
| `/api/ws/runs` | GET | SSE stream. Polls every 5s. Emits `event: run` when new file detected. |

Implementation notes:
- Import from `sys.path`-inserted `shared/log_reader.py` (same pattern as `phase1/app.py`).
- Return `404` with `{"detail": "Run not found: {ticker} / {date}"}` when `FileNotFoundError`.
- SSE endpoint uses `sse_starlette.sse.EventSourceResponse`. Maintain a `seen_paths: set` across
  requests to only emit truly new runs.

```python
# Sketch — SSE
async def run_stream():
    seen = set()
    while True:
        for run in list_runs():
            if run["path"] not in seen:
                seen.add(run["path"])
                yield {"event": "run", "data": json.dumps(run)}
        await asyncio.sleep(5)

@router.get("/ws/runs")
async def sse_runs():
    return EventSourceResponse(run_stream())
```

---

#### [NEW] `backend/services/__init__.py`

Empty file (directory already exists, just needs the `__init__.py`).

---

### Phase 3 — React SPA

> Bootstrap with Vite + React 18. Run **from the repo root** so FastAPI can serve `frontend/dist/`
> directly.

---

#### Scaffold Command

```powershell
# Run from d:/My_Projects/tradingagents_DD/
npx -y create-vite@latest frontend --template react
cd frontend
npm install react-grid-layout lucide-react marked
```

> **WARNING:** `frontend/` already has a `src/` scaffold with empty subdirectories
> (`components/`, `hooks/`, `panels/`, `services/`). The Vite scaffold will add files around
> them. Preserve existing empty dirs.

---

#### [MODIFY] `frontend/index.html`

Add Google Fonts import for `Inter` and `JetBrains Mono`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

---

#### [NEW] `frontend/src/index.css`

Global design tokens — match `DESIGN.md` exactly:

```css
:root {
  --color-bg: #0f1117;
  --color-surface: #1a1d27;
  --color-surface-2: #151821;
  --color-border: #2d3142;
  --color-accent: #22d3ee;
  --color-green: #34d399;
  --color-red: #f87171;
  --color-amber: #fbbf24;
  --color-text: #e2e8f0;
  --color-muted: #94a3b8;
  --color-dim: #475569;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
  --panel-radius: 8px;
  --panel-header-h: 36px;
}
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-ui); margin: 0; }
```

---

#### [NEW] `frontend/src/services/api.js`

Thin HTTP client wrapping all API calls:

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchTickers  = ()             => fetch(`${BASE}/api/tickers`).then(r => r.json());
export const fetchRuns     = (ticker)       => fetch(`${BASE}/api/runs?ticker=${ticker}`).then(r => r.json());
export const fetchRun      = (ticker, date) => fetch(`${BASE}/api/run/${ticker}/${date}`).then(r => r.json());
export const createRunSSE  = ()             => new EventSource(`${BASE}/api/ws/runs`);
```

---

#### [NEW] `frontend/src/hooks/useRunSSE.js`

Custom React hook — subscribes to SSE stream, calls `onNewRun(run)` on each event:

```js
export function useRunSSE(onNewRun) {
  useEffect(() => {
    const es = createRunSSE();
    es.addEventListener('run', e => onNewRun(JSON.parse(e.data)));
    return () => es.close();
  }, []);
}
```

---

#### [NEW] `frontend/src/components/RunSelector.jsx`

Header bar component.

- Props: `onLoad(ticker, date)`
- State: `tickers`, `selectedTicker`, `runs`, `selectedDate`, `newRunAvailable`
- On mount: fetch tickers → populate ticker dropdown
- On ticker change: fetch runs for that ticker → populate date dropdown
- On load button: call `onLoad(ticker, date)`
- Uses `useRunSSE` — if new run event matches `selectedTicker`, show cyan badge `"New run available"`

---

#### [NEW] `frontend/src/panels/AnalystsPanel.jsx`

- Props: `run` (full state object)
- Reads: `run.market_report`, `run.sentiment_report`, `run.news_report`, `run.fundamentals_report`
- Layout: 4 tabs (Market / Sentiment / News / Fundamentals). Active tab: cyan underline.
- Renders markdown with `marked.parse()`
- Empty state: `"No analyst reports found."`

---

#### [NEW] `frontend/src/panels/ResearchPanel.jsx`

- Props: `run`
- Reads: `run.investment_debate_state.bull_history`, `.bear_history`, `.judge_decision`
- Layout: 3 tabs (Bull / Bear / Research Manager)
- Same markdown renderer as Analysts

---

#### [NEW] `frontend/src/panels/TradingDecisionPanel.jsx`

- Props: `run`
- Reads: `run.trader_investment_decision`, `run.final_trade_decision`
- Action detection: scan `final_trade_decision.toLowerCase()` for `"buy"` / `"sell"` → default `HOLD`
- Renders: action badge (`badge-buy` / `badge-sell` / `badge-hold`) + markdown body

---

#### [NEW] `frontend/src/panels/RiskPanel.jsx`

- Props: `run`
- Reads: `run.risk_debate_state.aggressive_history`, `.conservative_history`, `.neutral_history`, `.judge_decision`
- Layout: up to 4 tabs (3 risk profiles + Risk Manager)

---

#### [NEW] `frontend/src/panels/PortfolioPanel.jsx`

- Props: `run`
- Reads: `run.investment_plan` (preferred) or `run.final_trade_decision`
- Layout: full-width, markdown content

---

#### [NEW] `frontend/src/panels/BacktestChartPanel.jsx`

- Props: `run`
- Placeholder only for now: `"No backtest data available. Run a backtest to see the equity curve."`
- Reserve the panel slot in the grid layout.

---

#### [NEW] `frontend/src/App.jsx`

Main application shell.

- State: `currentRun` (null until loaded), `loading`, `error`
- Layout: sticky `<RunSelector>` header + `<ResponsiveGridLayout>` body
- Grid: 12-column, `draggableHandle=".panel-header"`, layout saved to `localStorage`

Default layout (6 panels):

| Panel | x | y | w | h |
|-------|---|---|---|---|
| Analysts | 0 | 0 | 8 | 6 |
| Trading Decision | 8 | 0 | 4 | 6 |
| Research | 0 | 6 | 6 | 5 |
| Risk | 6 | 6 | 6 | 5 |
| Portfolio | 0 | 11 | 12 | 4 |
| Backtest Chart | 0 | 15 | 12 | 6 |

- Each panel wrapped in a `<div>` with a `key` for react-grid-layout
- Empty state (no run loaded): centered `"Select a ticker and date to load a run"` message

---

## Verification Plan

### Automated Smoke Tests

```powershell
# 1. Install backend deps and start the server
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000

# 2. REST endpoint checks
curl http://localhost:8000/api/tickers
# expected: ["AAPL"]

curl http://localhost:8000/api/runs
# expected: [{ticker: "AAPL", date: "2024-05-01", path: "..."}]

curl http://localhost:8000/api/run/AAPL/2024-05-01
# expected: full state JSON with all fields

curl http://localhost:8000/api/run/AAPL/9999-01-01
# expected: 404 {"detail": "Run not found: AAPL / 9999-01-01"}

# 3. SSE smoke test (streams; Ctrl+C to stop)
curl -N http://localhost:8000/api/ws/runs

# 4. Build React and verify SPA is served
cd frontend; npm run build; cd ..
# Reload http://localhost:8000 — should serve React index.html
```

### Manual Verification Checklist

- [ ] `http://localhost:8000` — Run Selector header visible
- [ ] Select `AAPL` → Date `2024-05-01` → click Load → all 6 panels render
- [ ] Drag a panel by its header → release → reload page → position persists
- [ ] `final_trade_decision` contains "HOLD" → amber badge shown
- [ ] `http://localhost:5000` (Phase 1 Flask) still works unchanged

---

## Handoff Note

```
## Handoff to [code_agent]

**Task:** Phase 2 (FastAPI backend) + Phase 3 (React SPA)
**Status:** pending
**Branch:** main (or create feat/phase2-backend + feat/phase3-react)

**What is done:**
- shared/log_reader.py — complete and verified (parents[1] resolves to workspace root results/)
- phase1/ (Flask MVP) — complete, verified, running on :5000. Do NOT modify.
- backend/services/ — directory exists but is empty
- frontend/src/{components,hooks,panels,services}/ — directories exist but are empty
- docs/ — full API spec, JSON schema, widget guide, and this implementation plan
- DESIGN.md — full design token spec

**What must be done next:**
1. Create backend/requirements.txt, backend/__init__.py, backend/main.py,
   backend/api/__init__.py, backend/api/routes.py, backend/services/__init__.py
2. python -m pip install -r backend/requirements.txt
3. uvicorn backend.main:app --reload --port 8000
4. Smoke-test all 4 API endpoints against sample AAPL run (see Verification Plan above)
5. npx -y create-vite@latest frontend --template react  (from repo root)
6. cd frontend && npm install react-grid-layout lucide-react marked
7. Implement frontend/src/index.css (copy tokens from DESIGN.md)
8. Implement frontend/src/services/api.js, hooks/useRunSSE.js
9. Implement all 6 panel components (panels/*.jsx) per docs/ui-widget-guide.md
10. Implement frontend/src/components/RunSelector.jsx
11. Implement frontend/src/App.jsx with react-grid-layout (12-col, draggableHandle)
12. npm run build in frontend/ → reload http://localhost:8000 → SPA served
13. Manual verification checklist (see above)
14. git add backend/ frontend/ ; git commit -m "feat: phase 2 FastAPI + phase 3 React SPA"
15. git push

**Blockers:** none

**Key findings:**
- shared/log_reader.py: DEFAULT_RESULTS_DIR uses parents[1] (not parents[0])
- Python command is bare `python` → pythoncore-3.13-64
- PowerShell: use semicolons (;) not && as command separators
- results/ and __pycache__/ are in .gitignore — do not commit sample logs
- Phase 1 Flask is on :5000. Phase 2 FastAPI is on :8000. Both run concurrently.
- frontend/ src/ subdirs already exist — Vite scaffold adds files around them, preserve dirs
```
