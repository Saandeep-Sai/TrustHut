import { useState, useCallback } from 'react';
import ChatWindow from './ChatWindow';
import { sendMessage } from '../../services/chatbot';

const WELCOME = {
  role: 'bot',
  text: "Hello! 👋 I'm your SafeSteps accessibility assistant.\n\nI can help you understand accessibility reports, check if locations are safe for elderly or wheelchair users, and guide you through the platform.\n\nAsk me anything!",
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSend = useCallback(async (text) => {
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Pass message history for context
      const reply = await sendMessage(text, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  return (
    <>
      {/* ─── CHAT WINDOW ─── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '88px', left: '24px', zIndex: 9999,
          animation: 'chatSlideUp 0.25s ease-out',
        }}>
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            loading={loading}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* ─── FLOATING BUTTON ─── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Ask SafeSteps Assistant"
        title="Ask SafeSteps Assistant"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none',
          background: isOpen
            ? 'linear-gradient(135deg, #1E40AF, #1D4ED8)'
            : 'linear-gradient(135deg, #3B82F6, #2563EB)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered
            ? '0 8px 30px rgba(37,99,235,0.5), 0 0 0 4px rgba(37,99,235,0.15)'
            : '0 6px 20px rgba(37,99,235,0.4)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? (
          /* X icon when open */
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon when closed */
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75a9.723 9.723 0 01-4.997-1.383L3 21.75l1.133-4.253A9.694 9.694 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75z" />
          </svg>
        )}
      </button>

      {/* ─── GLOBAL ANIMATIONS ─── */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 480px) {
          /* Make chat window full-width on tiny screens */
          div[style*="bottom: 88px"] > div { width: 90vw !important; }
        }
      `}</style>
    </>
  );
}
