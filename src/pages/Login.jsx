import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 48px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-up">
        <div style={{
          background: '#0C1322', border: '1px solid #1A2640', borderRadius: '20px',
          padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.99 8.99a.75.75 0 1 1-1.06 1.061l-1.46-1.46v7.318A2.25 2.25 0 0 1 16.75 22h-3v-5a.75.75 0 0 0-.75-.75h-2A.75.75 0 0 0 10.25 17v5h-3a2.25 2.25 0 0 1-2.25-2.25v-7.318L3.53 13.89a.75.75 0 1 1-1.06-1.06l8.99-8.99Z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Welcome back</h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Sign in to your TrustHut account</p>
          </div>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px', fontWeight: 500,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: '#2563EB', color: 'white', fontWeight: 600, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)', transition: 'all 0.25s ease',
              fontFamily: 'inherit',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
