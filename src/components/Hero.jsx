// src/components/Hero.jsx
import { useTheme } from '../context/ThemeContext';

export default function Hero({ onShareClick, onBrowseClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden',
      background: isDark ? '#060B14' : '#F1F5F9',
      paddingTop: '64px',
    }}>
      {/* Background image — sunny for light, night for dark */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: isDark ? "url('/skyline_hero.png')" : "url('/sunny_hero.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        transition: 'background-image 0.5s ease',
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isDark
          ? 'linear-gradient(to bottom, rgba(6,11,20,0.7) 0%, rgba(0,0,0,0.1) 40%, rgba(6,11,20,0.85) 80%, #060B14 100%)'
          : 'linear-gradient(to bottom, rgba(241,245,249,0.6) 0%, rgba(255,255,255,0.15) 40%, rgba(241,245,249,0.8) 80%, #F1F5F9 100%)',
        transition: 'background 0.5s ease',
      }} />

      {/* Blue glow orb */}
      <div style={{
        position: 'absolute',
        top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: isDark ? 0.035 : 0.02,
        pointerEvents: 'none',
        backgroundImage: isDark
          ? 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)'
          : 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '0 24px',
        maxWidth: '760px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)',
          border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(37,99,235,0.15)',
          borderRadius: '999px', padding: '6px 16px', marginBottom: '28px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: isDark ? '#60A5FA' : '#2563EB',
            boxShadow: isDark ? '0 0 8px rgba(96,165,250,0.8)' : '0 0 8px rgba(37,99,235,0.5)',
            animation: 'heroPulse 2s infinite',
          }} />
          <span style={{
            color: isDark ? '#93C5FD' : '#1D4ED8',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Community-Powered Accessibility
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          color: isDark ? '#FFFFFF' : '#0F172A',
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          margin: 0,
        }}>
          Explore{' '}
          <span className="hero-gradient-text" style={{
            backgroundImage: isDark
              ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)'
              : 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
          }}>
            Accessibility
          </span>
          <br />
          Before You Travel
        </h1>

        {/* Subtext */}
        <p style={{
          color: isDark ? '#CBD5E1' : '#475569',
          fontSize: '17px', marginTop: '20px',
          maxWidth: '520px', lineHeight: 1.65,
        }}>
          Real community reports from people on the ground — helping elderly and disabled travelers navigate safely.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onShareClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px', borderRadius: '12px',
              background: '#2563EB', color: 'white',
              fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Share Accessibility Report
          </button>

          <button onClick={onBrowseClick} style={{
            padding: '13px 28px', borderRadius: '12px',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
            color: isDark ? '#E2E8F0' : '#0F172A',
            fontWeight: 500, fontSize: '14px', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'; }}
          >
            Browse Reports
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '48px',
          marginTop: '56px', paddingTop: '32px',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          flexWrap: 'wrap', justifyContent: 'center',
          width: '100%',
        }}>
          {[
            { value: '2,400+', label: 'Reports Shared' },
            { value: '180+', label: 'Cities Covered' },
            { value: '12K+', label: 'Travelers Helped' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px',
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}>{value}</div>
              <div style={{
                fontSize: '10px', marginTop: '4px', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 500,
                color: isDark ? '#94A3B8' : '#64748B',
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '80px',
        background: isDark
          ? 'linear-gradient(to bottom, transparent, #060B14)'
          : 'linear-gradient(to bottom, transparent, #F1F5F9)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .hero-gradient-text {
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          color: transparent !important;
          display: inline;
        }
      `}</style>
    </section>
  );
}