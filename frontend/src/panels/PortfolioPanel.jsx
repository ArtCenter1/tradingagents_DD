import { marked } from 'marked';

export default function PortfolioPanel({ run }) {
  const plan = run?.investment_plan || run?.final_trade_decision || '';
  return (
    <div className="panel">
      <div className="panel-header"><span>📋</span> Final Trade Decision</div>
      <div className="panel-body">
        {plan ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(plan) }} />
        ) : (
          <p style={{ color: 'var(--color-muted)' }}>No decision data.</p>
        )}
      </div>
    </div>
  );
}
