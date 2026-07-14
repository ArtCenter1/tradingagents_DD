import { useState, useEffect } from 'react';
import { fetchTickers, fetchRuns } from '../services/api.js';
import { useRunSSE } from '../hooks/useRunSSE.js';

export default function RunSelector({ onLoad }) {
  const [tickers, setTickers] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [runs, setRuns] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [newRunAvailable, setNewRunAvailable] = useState(false);

  useEffect(() => {
    fetchTickers().then(t => {
      setTickers(t);
      if (t.length > 0) setSelectedTicker(t[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;
    fetchRuns(selectedTicker).then(r => {
      setRuns(r);
      if (r.length > 0) setSelectedDate(r[0].date);
    });
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
      <span className="brand">📊 TradingAgents_DD</span>
      <label style={{ color: 'var(--color-muted)', fontSize: 11 }}>Ticker</label>
      <select value={selectedTicker} onChange={e => setSelectedTicker(e.target.value)}>
        {tickers.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label style={{ color: 'var(--color-muted)', fontSize: 11 }}>Date</label>
      <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
        {runs.map(r => <option key={r.date} value={r.date}>{r.date}</option>)}
      </select>
      <button onClick={handleLoad} disabled={!selectedTicker || !selectedDate}>
        Load
      </button>
      {newRunAvailable && <span className="new-badge">New run available</span>}
    </header>
  );
}
