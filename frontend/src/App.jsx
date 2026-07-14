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

const STORAGE_KEY = 'tradingagents-dd-layout';

function loadSavedLayout() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

const panelNames = [
  { key: 'analysts',         label: 'Analyst Team' },
  { key: 'trading-decision', label: 'Trading Decision' },
  { key: 'research',         label: 'Research Team' },
  { key: 'risk',             label: 'Risk Management' },
  { key: 'portfolio',        label: 'Final Trade Decision' },
  { key: 'backtest',         label: 'Backtest Chart' },
];

export default function App() {
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState(loadSavedLayout() || DEFAULT_LAYOUT);

  const handleLoad = useCallback(async (ticker, date) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/run/${ticker}/${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrentRun(data);
    } catch (err) {
      alert(`Failed to load run: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  }, []);

  if (!currentRun) {
    return (
      <>
        <RunSelector onLoad={handleLoad} />
        <div className="loading-screen">
          {loading ? 'Loading...' : 'Select a ticker and date to load a run'}
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <RunSelector onLoad={handleLoad} />
        <div className="loading-screen">Loading...</div>
      </>
    );
  }

  const panels = {
    analysts:         <AnalystsPanel run={currentRun} />,
    'trading-decision': <TradingDecisionPanel run={currentRun} />,
    research:         <ResearchPanel run={currentRun} />,
    risk:             <RiskPanel run={currentRun} />,
    portfolio:        <PortfolioPanel run={currentRun} />,
    backtest:         <BacktestChartPanel run={currentRun} />,
  };

  return (
    <>
      <RunSelector onLoad={handleLoad} />
      <div style={{ padding: '16px 24px' }}>
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
          margin={[0, 0]}
        >
          {panelNames.map(p => (
            <div key={p.key}>
              {panels[p.key]}
            </div>
          ))}
        </GridLayout>
      </div>
    </>
  );
}
