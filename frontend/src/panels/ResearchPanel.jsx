import { useState } from 'react';
import { parseMarkdown } from '../utils.js';

const TABS = [
  { key: 'bull_history',   label: 'Bull',             icon: '🐂', variant: 'bull' },
  { key: 'bear_history',   label: 'Bear',             icon: '🐻', variant: 'bear' },
  { key: 'judge_decision', label: 'Research Manager', icon: '⚖️',  variant: '' },
];

export default function ResearchPanel({ run }) {
  const [active, setActive] = useState(0);
  const debate = run?.investment_debate_state;
  const content = debate?.[TABS[active].key];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">🔍</span>
        Research Team
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        <div className="tab-bar">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              className={`tab-btn${i === active ? ' active' : ''}`}
              data-variant={t.variant}
              onClick={() => setActive(i)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {content ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, color: 'var(--color-muted)' }}>
            <span style={{ fontSize: 24 }}>📭</span>
            <span style={{ fontSize: 11 }}>No {TABS[active].label} data found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
