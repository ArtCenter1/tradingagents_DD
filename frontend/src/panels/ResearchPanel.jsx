import { useState } from 'react';
import { marked } from 'marked';

export default function ResearchPanel({ run }) {
  const debate = run?.investment_debate_state;
  const tabs = [];
  if (debate?.bull_history) tabs.push('Bull');
  if (debate?.bear_history) tabs.push('Bear');
  if (debate?.judge_decision) tabs.push('Research Manager');
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;

  const fieldMap = { Bull: 'bull_history', Bear: 'bear_history', 'Research Manager': 'judge_decision' };
  const content = debate[fieldMap[tabs[active]]];

  return (
    <div className="panel">
      <div className="panel-header"><span>🔍</span> Research Team</div>
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
