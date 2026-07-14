export default function BacktestChartPanel({ run }) {
  return (
    <div className="panel">
      <div className="panel-header"><span>📈</span> Backtest Chart</div>
      <div className="panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
          No backtest data available.<br />
          Run a backtest to see the equity curve.
        </p>
      </div>
    </div>
  );
}
