import { useState } from 'react';
import { marked } from 'marked';

const TAB_META = [
  { key: 'aggressive_history',  label: 'Aggressive',   icon: '🔥', variant: 'aggr' },
  { key: 'conservative_history',label: 'Conservative', icon: '🛡️',  variant: 'cons' },
  { key: 'neutral_history',     label: 'Neutral',      icon: '⚖️',  variant: 'neutral' },
  { key: 'judge_decision',      label: 'Risk Manager', icon: '🧠', variant: '' },
];

export default function RiskPanel({ run }) {
  const [active, setActive] = useState(0);
  const risk = run?.risk_debate_state;
  const tabs = TAB_META.filter(t => risk?.[t.key]);
  if (tabs.length === 0) return null;

  const content = risk[tabs[active]?.key];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">🛡️</span>
        Risk Management
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        <div className="tab-bar">
          {tabs.map((t, i) => (
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
          <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, color: 'var(--color-muted)' }}>
            <span style={{ fontSize: 24 }}>📭</span>
            <span style={{ fontSize: 11 }}>No data for this profile.</span>
          </div>
        )}
      </div>
    </div>
  );
}
