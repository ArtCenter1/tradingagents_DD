export default function BacktestChartPanel({ run }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">📈</span>
        Backtest Chart
        <span style={{
          marginLeft: 'auto',
          fontSize: 9,
          color: 'var(--color-dim)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'none',
        }}>
          Coming in Phase 4
        </span>
      </div>
      <div className="panel-body" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        {/* Skeleton chart preview */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Fake candlestick bars */}
          {[0.6, 0.4, 0.75, 0.5, 0.85, 0.45, 0.65, 0.35, 0.7, 0.55, 0.8, 0.5].map((h, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 6,
              opacity: 0.35 + i * 0.04,
            }}>
              <div className="skeleton" style={{ flex: h, height: '100%', borderRadius: 2 }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>
            Equity curve will render here after backtesting.
          </div>
          <div style={{
            fontSize: 9.5,
            color: 'var(--color-dim)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
          }}>
            <span style={{ width: 6, height: 6, background: 'var(--color-accent)', borderRadius: '50%', display: 'inline-block', opacity: 0.4 }} />
            TradingView Lightweight Charts · Phase 4
          </div>
        </div>
      </div>
    </div>
  );
}
