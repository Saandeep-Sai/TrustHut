// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
    height: scrolled ? '56px' : '64px',
    background: scrolled ? 'rgba(6,11,20,0.97)' : 'rgba(6,11,20,0.6)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.35s ease',
  };

  const innerStyle = {
    maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

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
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>TrustHut</span>
        </Link>

        {/* Center pill nav — desktop */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '999px', padding: '5px',
        }} className="hide-mobile">
          {[{ to: '/', label: 'Home' }, { to: '/map', label: 'Map' }, { to: '/profile', label: 'Profile' }, { to: '/chatbot', label: 'Chatbot' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 18px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive(to) ? '#2563EB' : 'transparent',
              color: isActive(to) ? 'white' : '#94A3B8',
              boxShadow: isActive(to) ? '0 2px 12px rgba(37,99,235,0.4)' : 'none',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hide-mobile">
          {user ? (
            <button onClick={logout} style={{
              padding: '7px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', background: 'transparent',
            }}>Logout</button>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                color: 'white', background: '#2563EB', borderRadius: '8px',
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="show-mobile" style={{
          width: '36px', height: '36px', display: 'none', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#94A3B8', cursor: 'pointer',
        }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(6,11,20,0.99)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[{ to: '/', label: 'Home' }, { to: '/map', label: 'Map' }, { to: '/profile', label: 'Profile' }, { to: '/chatbot', label: 'Chatbot' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }} onClick={() => setMobileOpen(false)}>{label}</Link>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          {user ? (
            <button onClick={logout} style={{ textAlign: 'left', color: '#CBD5E1', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '8px 0' }}>Logout</button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '9px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '13px' }}>Login</Link>
              <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '9px', background: '#2563EB', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '13px' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}