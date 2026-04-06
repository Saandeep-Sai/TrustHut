import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/chatbot';
import MessageBubble from '../components/MessageBubble';

const SUGGESTIONS = [
  '🔍 Is Ameerpet Metro Station safe?',
  '♿ Wheelchair accessible places near me?',
  '📝 How to report an unsafe location?',
  '👴 Tips for elderly travelers',
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! 👋 I'm the SafeSteps Assistant.\n\nI can help you understand accessibility risks and find safe locations for elderly and disabled users.\n\nAsk me anything, or try a suggested query below!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const clean = text.replace(/^[^\w]*/, '').trim(); // Remove leading emoji
    if (!clean || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: clean }]);
    setLoading(true);

    try {
      const response = await sendMessage(clean, messages);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); send(input); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: '72px' }}>
      <div style={{
        maxWidth: '860px', margin: '0 auto', padding: '0 20px',
        height: 'calc(100vh - 72px)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 0',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
          }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>SafeSteps Assistant</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '2px 0 0' }}>AI-powered accessibility advisor</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.6)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 600 }}>Online</span>
          </div>
        </div>

        {/* Chat container */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
          marginBottom: '16px',
        }}>
          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="fade-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                <MessageBubble role={msg.role} text={msg.text} />
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, marginTop: '4px',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                }}>🤖</div>
                <div style={{
                  background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
                  padding: '14px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px',
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Suggestions — shown only initially */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 24px 16px' }}>
              <div style={{
                height: '1px', marginBottom: '14px',
                background: 'linear-gradient(to right, transparent, var(--border) 30%, var(--border) 70%, transparent)',
              }} />
              <p style={{
                fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase',
                letterSpacing: '0.12em', fontWeight: 600, marginBottom: '10px',
              }}>Try asking</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', borderRadius: '12px',
                    background: 'var(--bg-card-hover)', cursor: 'pointer',
                    transition: 'all 0.2s ease', fontFamily: 'inherit',
                    textAlign: 'left', lineHeight: 1.4,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#A5B4FC'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '16px 20px', borderTop: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about accessibility, safety, locations..."
                disabled={loading}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px',
                  background: 'var(--nav-pill-bg)',
                  border: '1px solid var(--nav-pill-border)',
                  color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--nav-pill-border)'; }}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{
                padding: '12px 20px', borderRadius: '12px', border: 'none',
                background: (loading || !input.trim()) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: 'white', fontWeight: 600, fontSize: '13px',
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !input.trim()) ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'all 0.2s ease', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
