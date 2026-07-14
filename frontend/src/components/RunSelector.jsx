import { useState, useEffect } from 'react';
import { fetchTickers, fetchRuns } from '../services/api.js';
import { useRunSSE } from '../hooks/useRunSSE.js';

export default function RunSelector({ onLoad, loading, currentRun }) {
  const [tickers, setTickers] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [runs, setRuns] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [newRunAvailable, setNewRunAvailable] = useState(false);

  useEffect(() => {
    fetchTickers().then(t => {
      setTickers(t);
      if (t.length > 0) setSelectedTicker(t[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;
    fetchRuns(selectedTicker).then(r => {
      setRuns(r);
      if (r.length > 0) setSelectedDate(r[0].date);
    }).catch(() => {});
  }, [selectedTicker]);

  useRunSSE(run => {
    if (run.ticker === selectedTicker) setNewRunAvailable(true);
  });

  const handleLoad = () => {
    if (selectedTicker && selectedDate) {
      setNewRunAvailable(false);
      onLoad(selectedTicker, selectedDate);
    }
  };

  return (
    <header className="run-selector">
      {/* Brand */}
      <a className="brand" href="/" style={{ textDecoration: 'none' }}>
        <div className="brand-icon">📊</div>
        <span className="brand-text">TradingAgents DD</span>
        <span className="brand-version">v2.0</span>
      </a>

      <div className="selector-divider" />

      {/* Status dot */}
      <div className="status-dot" title="API connected" />

      <div className="selector-divider" />

      {/* Ticker */}
      <div className="selector-group">
        <span className="selector-label">Ticker</span>
        <select
          className="selector-select"
          value={selectedTicker}
          onChange={e => setSelectedTicker(e.target.value)}
        >
          {tickers.length === 0 && <option value="">—</option>}
          {tickers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Date */}
      <div className="selector-group">
        <span className="selector-label">Date</span>
        <select
          className="selector-select"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ minWidth: 120 }}
        >
          {runs.length === 0 && <option value="">—</option>}
          {runs.map(r => <option key={r.date} value={r.date}>{r.date}</option>)}
        </select>
      </div>

      {/* Load */}
      <button
        className="load-btn"
        onClick={handleLoad}
        disabled={!selectedTicker || !selectedDate || loading}
      >
        {loading ? '···' : 'Load'}
      </button>

      {/* New run badge */}
      {newRunAvailable && (
        <span className="new-badge">⚡ New run</span>
      )}

      <div className="navbar-spacer" />

      {/* Current run info */}
      {currentRun && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="ticker-date" style={{ borderColor: 'rgba(34,211,238,0.2)', color: 'var(--color-accent)' }}>
            {selectedTicker} · {selectedDate}
          </span>
        </div>
      )}
    </header>
  );
}
