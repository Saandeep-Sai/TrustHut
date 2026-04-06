import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength, PasswordStrengthBar } from './Login';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Password strength validation
    const strength = getPasswordStrength(password);
    if (strength.score < 3) {
      setError('Password is too weak. It must include uppercase, lowercase, numbers, and special characters.');
      return;
    }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try { await signup(name, email, password); navigate('/'); }
    catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
  const labelStyle = { fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 48px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-up">
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
          padding: '36px', boxShadow: '0 20px 60px var(--shadow-card)',
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
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Join the SafeSteps community</p>
          </div>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px', fontWeight: 500,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="johndoe" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" placeholder="••••••••" />
              <PasswordStrengthBar password={password} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input" placeholder="••••••••" />
              {confirmPassword && password !== confirmPassword && (
                <span style={{ fontSize: '11px', color: '#F87171', marginTop: '2px' }}>⚠ Passwords do not match</span>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <span style={{ fontSize: '11px', color: '#34D399', marginTop: '2px' }}>✓ Passwords match</span>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: '#2563EB', color: 'white', fontWeight: 600, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)', transition: 'all 0.25s ease',
              fontFamily: 'inherit',
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
