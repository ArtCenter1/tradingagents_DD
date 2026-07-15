import { parseMarkdown } from '../utils.js';

function detectAction(text) {
  if (!text) return 'HOLD';
  const t = text.toLowerCase();
  if (t.includes('buy')) return 'BUY';
  if (t.includes('sell')) return 'SELL';
  return 'HOLD';
}

const actionMeta = {
  BUY:  { icon: '↑', sub: 'Strong Buy Signal' },
  SELL: { icon: '↓', sub: 'Strong Sell Signal' },
  HOLD: { icon: '—', sub: 'Hold Position' },
};

export default function TradingDecisionPanel({ run }) {
  const decision = run?.final_trade_decision || '';
  const traderPlan = run?.trader_investment_decision || '';
  const action = detectAction(decision);
  const meta = actionMeta[action];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">🎯</span>
        Trading Decision
      </div>
      <div className="panel-body">
        {/* Glowing badge */}
        <div className="action-badge-wrap">
          <div className={`action-badge badge-${action.toLowerCase()}`}>
            {meta.icon} {action}
          </div>
          <div className="action-sub">{meta.sub}</div>
        </div>

        {/* Final decision text */}
        {decision && (
          <>
            <div className="section-label">Final Decision</div>
            <div style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 11,
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
            }}>
              {decision.length > 200 ? decision.slice(0, 200) + '…' : decision}
            </div>
          </>
        )}

        {/* Trader's plan */}
        <div className="section-label" style={{ marginTop: 4 }}>Trader's Plan</div>
        {traderPlan ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(traderPlan) }} />
        ) : (
          <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>No trading plan available.</p>
        )}
      </div>
    </div>
  );
}
