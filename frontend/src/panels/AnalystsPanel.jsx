import { useState } from 'react';
import { marked } from 'marked';

const tabs = ['Market', 'Sentiment', 'News', 'Fundamentals'];
const fieldMap = {
  Market: 'market_report',
  Sentiment: 'sentiment_report',
  News: 'news_report',
  Fundamentals: 'fundamentals_report',
};

export default function AnalystsPanel({ run }) {
  const [active, setActive] = useState(0);
  const content = run?.[fieldMap[tabs[active]]];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>📊</span> Analyst Team
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="tab-bar">
          {tabs.map((name, i) => (
            <button key={name} className={`tab-btn${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}>{name}</button>
          ))}
        </div>
        {content ? (
          <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        ) : (
          <p style={{ color: 'var(--color-muted)' }}>No analyst reports found.</p>
        )}
      </div>
    </div>
  );
}
