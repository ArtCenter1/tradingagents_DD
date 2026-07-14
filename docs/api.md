# API Reference — tradingagents_DD

## Base URL

```
http://localhost:8000/api
```

## Endpoints

### `GET /api/runs`

List all available TradingAgents runs.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `ticker` | string (optional) | Filter by ticker symbol |

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "date": "2025-07-10",
    "path": "D:/.../results/AAPL/TradingAgentsStrategy_logs/full_states_log_2025-07-10.json"
  }
]
```

**Status codes:** `200 OK`

---

### `GET /api/run/{ticker}/{date}`

Load a single run's full state JSON.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `ticker` | string | Stock ticker symbol |
| `date` | string | Date in `YYYY-MM-DD` format |

**Response:** Full state object (see `docs/run-report-schema.md`)

**Status codes:**
- `200 OK` — run found
- `404 Not Found` — run does not exist

---

### `GET /api/tickers`

List all ticker symbols with at least one run.

**Response:**
```json
["AAPL", "GOOGL", "TSLA"]
```

**Status codes:** `200 OK`

---

### `GET /api/ws/runs` (SSE)

Server-Sent Events stream of new runs. Polls every 5 seconds.

**Event types:**
| Event | Data | Description |
|-------|------|-------------|
| `run` | `{"ticker", "date", "path"}` | A new run was detected |

**Example client usage:**
```js
const es = new EventSource('http://localhost:8000/api/ws/runs');
es.addEventListener('run', (e) => {
  const run = JSON.parse(e.data);
  console.log('New run:', run.ticker, run.date);
});
```

**Status codes:** `200 OK` (never closes unless client disconnects)

---

## Error Response Shape

```json
{
  "detail": "Run not found: AAPL / 2025-01-01"
}
```