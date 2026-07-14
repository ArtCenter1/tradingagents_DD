import { marked } from 'marked';

export default function PortfolioPanel({ run }) {
  const plan = run?.investment_plan || run?.final_trade_decision || '';

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">📋</span>
        Portfolio Manager
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-dim)',
          textTransform: 'none',
          letterSpacing: 0,
        }}>
          Final synthesis
        </span>
      </div>
      <div className="panel-body" style={{ padding: '14px 16px' }}>
        {plan ? (
          <>
            <div className="portfolio-highlight">
              <div className="section-label">Investment Plan</div>
              <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(plan) }} />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--color-muted)' }}>
            <span style={{ fontSize: 24 }}>📭</span>
            <span style={{ fontSize: 11 }}>No portfolio decision data available.</span>
          </div>
        )}
      </div>
    </div>
  );
}
