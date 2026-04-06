import { useState, useRef } from 'react';

const SUGGESTIONS = [
  'Is this wheelchair friendly?',
  'Tips for elderly travelers',
  'How to post a report?',
];

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || loading) return;
    onSend(msg);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px 12px', background: 'var(--bg-card)' }}>
      {/* Suggestion pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => { setText(''); onSend(s); }}
            disabled={loading}
            style={{
              padding: '4px 10px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 500,
              background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
              color: '#60A5FA', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; }}
          >{s}</button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about accessibility..."
          disabled={loading}
          style={{
            flex: 1, padding: '9px 12px', fontSize: '12.5px',
            background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px',
            color: 'var(--text-primary)', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.5)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <button onClick={handleSend} disabled={loading || !text.trim()}
          style={{
            padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: text.trim() && !loading ? '#2563EB' : 'var(--border)',
            color: 'white', fontSize: '12px', fontWeight: 600,
            transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
