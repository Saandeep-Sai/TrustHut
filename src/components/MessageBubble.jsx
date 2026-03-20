import { useMemo } from 'react';

/**
 * Parse markdown-like text into React elements.
 * Supports: **bold**, *italic*, `code`, numbered lists, bullet lists, line breaks.
 */
function renderMarkdown(text) {
  if (!text) return null;

  // Split into lines for block-level parsing
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ol' | 'ul'

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol key={`ol-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: 1.7 }}>
          {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: 1.7 }}>
          {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Numbered list: 1. text, 2. text, etc.
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[1]);
      continue;
    }

    // Bullet list: - text or • text
    const ulMatch = trimmed.match(/^[-•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    // Not a list item — flush any pending list
    flushList();

    // Empty line = paragraph break
    if (trimmed === '') {
      elements.push(<div key={`br-${i}`} style={{ height: '8px' }} />);
      continue;
    }

    // Regular text line
    elements.push(
      <span key={`line-${i}`}>
        {i > 0 && elements.length > 0 && <br />}
        {parseInline(trimmed)}
      </span>
    );
  }

  flushList(); // Flush any remaining list
  return elements;
}

/**
 * Parse inline markdown: **bold**, *italic*, `code`
 */
function parseInline(text) {
  // Regex to match **bold**, *italic*, and `code` patterns
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Try bold: **text**
    let match = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<strong key={key++} style={{ color: 'inherit', fontWeight: 700 }}>{match[2]}</strong>);
      remaining = match[3];
      continue;
    }

    // Try italic: *text*
    match = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<em key={key++}>{match[2]}</em>);
      remaining = match[3];
      continue;
    }

    // Try inline code: `text`
    match = remaining.match(/^(.*?)`(.+?)`(.*)/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(
        <code key={key++} style={{
          background: 'rgba(255,255,255,0.08)', padding: '1px 5px',
          borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace',
        }}>{match[2]}</code>
      );
      remaining = match[3];
      continue;
    }

    // No more patterns — push the rest as plain text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}

export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  const rendered = useMemo(() => isUser ? text : renderMarkdown(text), [text, isUser]);

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: '8px', marginBottom: '8px' }}>
      {/* Bot avatar */}
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, marginTop: '4px',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
        }}>🤖</div>
      )}

      <div style={{
        maxWidth: '80%', padding: '12px 16px', fontSize: '13px',
        lineHeight: 1.7,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? '#6366F1' : '#111B2E',
        color: isUser ? 'white' : '#CBD5E1',
        border: isUser ? 'none' : '1px solid #1A2640',
      }}>
        {rendered}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, marginTop: '4px',
          background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" fill="none" stroke="#A5B4FC" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
