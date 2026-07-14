import { useState } from 'react';
import { marked } from 'marked';

export default function RiskPanel({ run }) {
  const risk = run?.risk_debate_state;
  const tabs = [];
  if (risk?.aggressive_history) tabs.push('Aggressive');
  if (risk?.conservative_history) tabs.push('Conservative');
  if (risk?.neutral_history) tabs.push('Neutral');
  if (risk?.judge_decision) tabs.push('Risk Manager');
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;

  const fieldMap = {
    Aggressive: 'aggressive_history', Conservative: 'conservative_history',
    Neutral: 'neutral_history', 'Risk Manager': 'judge_decision',
  };
  const content = risk[fieldMap[tabs[active]]];

  return (
    <div className="panel">
      <div className="panel-header"><span>🛡️</span> Risk Management</div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="tab-bar">
          {tabs.map((n, i) => (
            <button key={n} className={`tab-btn${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}>{n}</button>
          ))}
        </div>
        <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
      </div>
    </div>
  );
}
