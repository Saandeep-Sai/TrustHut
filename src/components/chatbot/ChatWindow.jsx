import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export default function ChatWindow({ messages, onSend, loading, onClose }) {
  const bodyRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div style={{
      width: '340px', height: '480px', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
      overflow: 'hidden',
      animation: 'chatSlideUp 0.25s ease-out',
    }}>
      {/* ─── HEADER ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)',
      }}>
        {/* Bot avatar */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37,99,235,0.35)', fontSize: '15px',
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>SafeSteps Assistant</p>
          <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)' }}>Accessibility Guide</p>
        </div>
        {/* Online dot */}
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E',
          boxShadow: '0 0 6px rgba(34,197,94,0.5)',
        }} />
        {/* Close button */}
        <button onClick={onClose} style={{
          width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: 'var(--nav-pill-bg)', color: 'var(--text-muted)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-pill-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--nav-pill-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ─── MESSAGE BODY ─── */}
      <div ref={bodyRef} style={{
        flex: 1, overflowY: 'auto', padding: '14px 12px',
        scrollBehavior: 'smooth',
      }}>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 0' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
            }}>🤖</div>
            <div style={{
              display: 'flex', gap: '4px', padding: '10px 14px',
              background: 'var(--border)', borderRadius: '14px 14px 14px 4px',
              border: '1px solid var(--nav-border)',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)',
                  animation: `chatDotBounce 1.4s infinite ease-in-out`,
                  animationDelay: `${i * 0.16}s`,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── INPUT ─── */}
      <ChatInput onSend={onSend} loading={loading} />

      {/* Scoped animations */}
      <style>{`
        @keyframes chatDotBounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
