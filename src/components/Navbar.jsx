// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../services/auth';
import { useState, useEffect } from 'react';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: '36px', height: '36px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {isDark ? (
        /* Sun icon */
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDark = theme === 'dark';

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
    height: scrolled ? '56px' : '64px',
    background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--nav-border)',
    transition: 'all 0.35s ease',
  };

  const innerStyle = {
    maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  const linkColor = (path) => isActive(path) ? 'white' : 'var(--text-secondary)';

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          }}>
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.99 8.99a.75.75 0 1 1-1.06 1.061l-1.46-1.46v7.318A2.25 2.25 0 0 1 16.75 22h-3v-5a.75.75 0 0 0-.75-.75h-2A.75.75 0 0 0 10.25 17v5h-3a2.25 2.25 0 0 1-2.25-2.25v-7.318L3.53 13.89a.75.75 0 1 1-1.06-1.06l8.99-8.99Z" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>SafeSteps</span>
        </Link>

        {/* Center pill nav — desktop */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'var(--nav-pill-bg)',
          border: '1px solid var(--nav-pill-border)',
          borderRadius: '999px', padding: '5px',
        }} className="hide-mobile">
          {[{ to: '/', label: 'Home' }, { to: '/map', label: 'Map' }, { to: '/highway-safety', label: 'Highway' }, { to: '/route-optimizer', label: 'Routes' }, { to: '/profile', label: 'Profile' }, { to: '/admin', label: 'Admin' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 18px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive(to) ? '#2563EB' : 'transparent',
              color: isActive(to) ? 'white' : 'var(--text-secondary)',
              boxShadow: isActive(to) ? '0 2px 12px rgba(37,99,235,0.4)' : 'none',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="hide-mobile">
          <ThemeToggle />
          {user ? (
            <button onClick={logout} style={{
              padding: '7px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              color: 'var(--text-secondary)', border: '1px solid var(--border)',
              borderRadius: '8px', background: 'transparent',
              transition: 'all 0.2s ease',
            }}>Logout</button>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                color: 'white', background: '#2563EB', borderRadius: '8px',
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile right: theme toggle + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="show-mobile">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--nav-mobile-bg)', borderBottom: '1px solid var(--nav-border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[{ to: '/', label: 'Home' }, { to: '/map', label: 'Map' }, { to: '/highway-safety', label: 'Highway Safety' }, { to: '/route-optimizer', label: 'Route Optimizer' }, { to: '/profile', label: 'Profile' }, { to: '/admin', label: 'Admin' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }} onClick={() => setMobileOpen(false)}>{label}</Link>
          ))}
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
          {user ? (
            <button onClick={logout} style={{ textAlign: 'left', color: 'var(--text-primary)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '8px 0' }}>Logout</button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '9px', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '13px' }}>Login</Link>
              <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '9px', background: '#2563EB', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '13px' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}