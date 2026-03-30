import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { sendOtp, verifyOtpAndReset } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Password Strength Logic (shared) ───
export function getPasswordStrength(pw) {
  let score = 0;
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  score = Object.values(checks).filter(Boolean).length;
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];
  return { score, label: labels[score], color: colors[score], checks };
}

export function PasswordStrengthBar({ password }) {
  const { score, label, color, checks } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: '8px' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= score ? color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{label}</span>
      </div>
      {/* Checklist */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: '6px' }}>
        {[
          { key: 'length', label: '8+ characters' },
          { key: 'uppercase', label: 'Uppercase' },
          { key: 'lowercase', label: 'Lowercase' },
          { key: 'number', label: 'Number' },
          { key: 'special', label: 'Special char' },
        ].map(c => (
          <span key={c.key} style={{
            fontSize: '10px', color: checks[c.key] ? '#34D399' : '#475569',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            {checks[c.key] ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Forgot Password Modal ───
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email.'); return; }
    setLoading(true); setError('');
    try {
      await sendOtp(email.trim());
      setStep(2);
      setSuccess('OTP sent! Check your email inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!otp.trim()) { setError('Enter the OTP.'); return; }
    if (newPassword !== confirmNew) { setError('Passwords do not match.'); return; }
    const strength = getPasswordStrength(newPassword);
    if (strength.score < 3) { setError('Password is too weak. Use uppercase, lowercase, numbers & special characters.'); return; }

    setLoading(true);
    try {
      const res = await verifyOtpAndReset(email.trim(), otp.trim(), newPassword);
      setSuccess(res.data.message || 'Password reset! You can now log in.');
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '13px', boxSizing: 'border-box',
    background: '#020617', border: '1px solid #1E293B', borderRadius: '10px',
    color: '#E2E8F0', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '420px',
        background: '#0F172A', border: '1px solid #1E293B', borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #1E293B',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
              {step === 1 ? 'We\'ll send an OTP to your email' : 'Enter OTP and set new password'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px',
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#34D399', fontSize: '12px',
            }}>{success}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} required />
              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px',
                background: loading ? '#1E40AF' : '#2563EB', border: 'none',
                color: 'white', fontSize: '13px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
            </form>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>OTP Code</label>
                <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                  placeholder="6-digit OTP" style={{ ...inputStyle, letterSpacing: '6px', textAlign: 'center', fontSize: '18px', fontWeight: 700 }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••" style={inputStyle} required />
                <PasswordStrengthBar password={newPassword} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Confirm New Password</label>
                <input type="password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)}
                  placeholder="••••••••" style={inputStyle} required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', cursor: 'pointer',
                }}>Back</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  background: loading ? '#1E40AF' : '#2563EB', border: 'none',
                  color: 'white', cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
              </div>
              <button type="button" onClick={handleSendOtp} disabled={loading} style={{
                background: 'none', border: 'none', color: '#64748B', fontSize: '11px',
                cursor: 'pointer', padding: '4px 0', textAlign: 'center',
              }}>Resend OTP</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
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

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button type="button" onClick={() => setShowForgot(true)} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: '#3B82F6', fontSize: '12px', fontWeight: 500,
              }}>Forgot password?</button>
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

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
