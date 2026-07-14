const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchTickers  = ()             => fetch(`${BASE}/api/tickers`).then(r => r.json());
export const fetchRuns     = (ticker)       => fetch(`${BASE}/api/runs?ticker=${ticker}`).then(r => r.json());
export const fetchRun      = (ticker, date) => fetch(`${BASE}/api/run/${ticker}/${date}`).then(r => r.json());
export const createRunSSE  = ()             => new EventSource(`${BASE}/api/ws/runs`);
