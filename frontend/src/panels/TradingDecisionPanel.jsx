import { marked } from 'marked';

function detectAction(text) {
  if (!text) return 'HOLD';
  const t = text.toLowerCase();
  if (t.includes('buy')) return 'BUY';
  if (t.includes('sell')) return 'SELL';
  return 'HOLD';
}

export default function TradingDecisionPanel({ run }) {
  const decision = run?.final_trade_decision || '';
  const traderPlan = run?.trader_investment_plan || '';
  const action = detectAction(decision);

  return (
    <div className="panel">
      <div className="panel-header"><span>🎯</span> Trading Decision</div>
      <div className="panel-body">
        <div className="section-label">Final Action</div>
        <div className={`action-badge badge-${action.toLowerCase()}`}>{action}</div>
        <div className="section-label" style={{ marginTop: '1rem' }}>Trader's Plan</div>
        {traderPlan ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(traderPlan) }} />
        ) : (
          <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>No trading plan.</p>
        )}
      </div>
    </div>
  );
}
