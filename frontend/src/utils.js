import { marked } from 'marked';

export function parseMarkdown(content) {
  if (!content) return '';
  
  if (Array.isArray(content)) {
    const str = content.map(item => {
      if (typeof item === 'string') return item;
      if (item && item.content) return item.content;
      return JSON.stringify(item, null, 2);
    }).join('\n\n---\n\n');
    return marked.parse(str);
  }
  
  if (typeof content !== 'string') {
    return marked.parse(JSON.stringify(content, null, 2));
  }
  
  return marked.parse(content);
}
