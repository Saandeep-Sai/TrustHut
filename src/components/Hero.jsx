// src/components/Hero.jsx

export default function Hero({ onShareClick }) {
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
      background: '#060B14',
      paddingTop: '64px',
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('/skyline_hero.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(6,11,20,0.55) 0%, rgba(6,11,20,0.4) 40%, rgba(6,11,20,0.95) 85%, #060B14 100%)',
      }} />

      {/* Blue glow orb */}
      <div style={{
        position: 'absolute',
        top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
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
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '999px', padding: '6px 16px', marginBottom: '28px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#60A5FA',
            boxShadow: '0 0 8px rgba(96,165,250,0.8)',
            animation: 'heroPulse 2s infinite',
          }} />
          <span style={{ color: '#93C5FD', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Community-Powered Accessibility
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          margin: 0,
        }}>
          Explore{' '}
          <span style={{
            background: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Accessibility
          </span>
          <br />
          Before You Travel
        </h1>

        {/* Subtext */}
        <p style={{
          color: '#94A3B8', fontSize: '17px', marginTop: '20px',
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

          <button style={{
            padding: '13px 28px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: '#CBD5E1', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#CBD5E1'; }}
          >
            Browse Reports
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '48px',
          marginTop: '56px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexWrap: 'wrap', justifyContent: 'center',
          width: '100%',
        }}>
          {[
            { value: '2,400+', label: 'Reports Shared' },
            { value: '180+', label: 'Cities Covered' },
            { value: '12K+', label: 'Travelers Helped' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{value}</div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, transparent, #060B14)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </section>
  );
}