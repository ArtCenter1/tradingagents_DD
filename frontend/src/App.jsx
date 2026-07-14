import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import RunSelector from './components/RunSelector.jsx';
import AnalystsPanel from './panels/AnalystsPanel.jsx';
import ResearchPanel from './panels/ResearchPanel.jsx';
import TradingDecisionPanel from './panels/TradingDecisionPanel.jsx';
import RiskPanel from './panels/RiskPanel.jsx';
import PortfolioPanel from './panels/PortfolioPanel.jsx';
import BacktestChartPanel from './panels/BacktestChartPanel.jsx';

const DEFAULT_LAYOUT = [
  { i: 'analysts',          x: 0,  y: 0,  w: 8,  h: 6, minH: 4 },
  { i: 'trading-decision',  x: 8,  y: 0,  w: 4,  h: 6, minH: 4 },
  { i: 'research',          x: 0,  y: 6,  w: 6,  h: 5, minH: 3 },
  { i: 'risk',              x: 6,  y: 6,  w: 6,  h: 5, minH: 3 },
  { i: 'portfolio',         x: 0,  y: 11, w: 12, h: 4, minH: 3 },
  { i: 'backtest',          x: 0,  y: 15, w: 12, h: 6, minH: 3 },
];

const STORAGE_KEY = 'tradingagents-dd-layout-v2';

function loadSavedLayout() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

const panelOrder = [
  'analysts',
  'trading-decision',
  'research',
  'risk',
  'portfolio',
  'backtest',
];

// Stagger delays for reveal animation
const staggerDelays = {
  'analysts':         '0s',
  'trading-decision': '0.06s',
  'research':         '0.12s',
  'risk':             '0.18s',
  'portfolio':        '0.24s',
  'backtest':         '0.30s',
};

export default function App() {
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState(loadSavedLayout() || DEFAULT_LAYOUT);
  const [runKey, setRunKey] = useState(0); // force re-mount on new run for animation

  const handleLoad = useCallback(async (ticker, date) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/run/${ticker}/${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrentRun(data);
      setRunKey(k => k + 1);
    } catch (err) {
      // Show error in a non-blocking way
      console.error('Failed to load run:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  }, []);

  const panels = {
    analysts:           <AnalystsPanel run={currentRun} />,
    'trading-decision': <TradingDecisionPanel run={currentRun} />,
    research:           <ResearchPanel run={currentRun} />,
    risk:               <RiskPanel run={currentRun} />,
    portfolio:          <PortfolioPanel run={currentRun} />,
    backtest:           <BacktestChartPanel run={currentRun} />,
  };

  return (
    <>
      <RunSelector onLoad={handleLoad} loading={loading} currentRun={currentRun} />

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Fetching run data…
          </span>
        </div>
      ) : !currentRun ? (
        <div className="idle-screen">
          {/* Animated orb */}
          <div className="idle-orb">
            <div className="idle-orb-ring-2" />
            <div className="idle-orb-ring" />
            <div className="idle-orb-inner">
              <span className="idle-logo">📊</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="idle-title">TradingAgents Dashboard</div>
            <div className="idle-sub" style={{ marginTop: 10 }}>
              Select a ticker and date from the header, then click{' '}
              <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>Load</span>{' '}
              to visualize the AI agent analysis.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            {['Analyst Team', 'Research', 'Risk Mgmt', 'Decision'].map(label => (
              <div key={label} style={{
                fontSize: 9.5,
                color: 'var(--color-dim)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span style={{ width: 5, height: 5, background: 'var(--color-border)', borderRadius: '50%', display: 'inline-block' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid-wrapper" key={runKey}>
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={50}
            width={1200}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".panel-header"
            isResizable={true}
            compactType="vertical"
            margin={[8, 8]}
          >
            {panelOrder.map(key => (
              <div key={key} style={{ '--stagger': staggerDelays[key] }}>
                {panels[key]}
              </div>
            ))}
          </GridLayout>
        </div>
      )}
    </>
  );
}
