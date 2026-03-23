import { useMemo } from 'react';

/**
 * Parse markdown text into React elements.
 * Supports: **bold**, *italic*, `code`, numbered lists, bullet lists, line breaks.
 */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} style={{ margin: '6px 0', paddingLeft: '18px', lineHeight: 1.65 }}>
        {listItems.map((item, i) => <li key={i} style={{ marginBottom: '2px' }}>{parseInline(item)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) { if (listType !== 'ol') flushList(); listType = 'ol'; listItems.push(olMatch[1]); continue; }
    const ulMatch = trimmed.match(/^[-•]\s+(.+)/);
    if (ulMatch) { if (listType !== 'ul') flushList(); listType = 'ul'; listItems.push(ulMatch[1]); continue; }
    flushList();
    if (trimmed === '') { elements.push(<div key={`br-${i}`} style={{ height: '6px' }} />); continue; }
    elements.push(<span key={`l-${i}`}>{i > 0 && elements.length > 0 && <br />}{parseInline(trimmed)}</span>);
  }
  flushList();
  return elements;
}

function parseInline(text) {
  const parts = [];
  let rest = text;
  let k = 0;
  while (rest.length > 0) {
    let m = rest.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (m) { if (m[1]) parts.push(<span key={k++}>{m[1]}</span>); parts.push(<strong key={k++}>{m[2]}</strong>); rest = m[3]; continue; }
    m = rest.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (m) { if (m[1]) parts.push(<span key={k++}>{m[1]}</span>); parts.push(<em key={k++}>{m[2]}</em>); rest = m[3]; continue; }
    m = rest.match(/^(.*?)`(.+?)`(.*)/s);
    if (m) { if (m[1]) parts.push(<span key={k++}>{m[1]}</span>); parts.push(<code key={k++} style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.88em' }}>{m[2]}</code>); rest = m[3]; continue; }
    parts.push(<span key={k++}>{rest}</span>); break;
  }
  return parts;
}

export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  const rendered = useMemo(() => isUser ? text : renderMarkdown(text), [text, isUser]);

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: '6px', marginBottom: '6px' }}>
      {!isUser && (
        <div style={{
          width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '85%', padding: '10px 14px', fontSize: '12.5px', lineHeight: 1.65,
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? '#2563EB' : '#1E293B',
        color: isUser ? 'white' : '#CBD5E1',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)',
      }}>
        {rendered}
      </div>
    </div>
  );
}
