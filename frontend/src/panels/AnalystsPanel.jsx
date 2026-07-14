import { useState } from 'react';
import { marked } from 'marked';

const tabs = ['Market', 'Sentiment', 'News', 'Fundamentals'];
const fieldMap = {
  Market: 'market_report',
  Sentiment: 'sentiment_report',
  News: 'news_report',
  Fundamentals: 'fundamentals_report',
};
const tabIcons = {
  Market: '📈',
  Sentiment: '💬',
  News: '📰',
  Fundamentals: '🏦',
};

export default function AnalystsPanel({ run }) {
  const [active, setActive] = useState(0);
  const content = run?.[fieldMap[tabs[active]]];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">📊</span>
        Analyst Team
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-dim)' }}>
          {tabs.length} reports
        </span>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        <div className="tab-bar">
          {tabs.map((name, i) => (
            <button
              key={name}
              className={`tab-btn${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              {tabIcons[name]} {name}
            </button>
          ))}
        </div>
        {content ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, color: 'var(--color-muted)' }}>
            <span style={{ fontSize: 24 }}>📭</span>
            <span style={{ fontSize: 11 }}>No {tabs[active]} report found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
