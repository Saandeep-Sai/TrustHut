import { useState, useEffect } from 'react';
import { getAllUsers, getPosts, deletePost } from '../services/api';
import EditPostModal from '../components/EditPostModal';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || '';

const INPUT_STYLE = {
  width: '100%', padding: '12px 16px', fontSize: '14px', boxSizing: 'border-box',
  background: '#020617', border: '1px solid #1E293B', borderRadius: '12px',
  color: '#E2E8F0', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const TAB_STYLE = (active) => ({
  padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  background: active ? '#2563EB' : 'rgba(255,255,255,0.04)',
  color: active ? 'white' : '#94A3B8',
  boxShadow: active ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
});

const CELL = { padding: '12px 16px', fontSize: '13px', color: '#CBD5E1', borderBottom: '1px solid #1A2640' };
const HDR = { ...CELL, color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' };

function RiskBadge({ level }) {
  const cfg = {
    safe: { bg: 'rgba(16,185,129,0.12)', color: '#34D399' },
    moderate: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D' },
    unsafe: { bg: 'rgba(239,68,68,0.12)', color: '#F87171' },
  };
  const c = cfg[level] || cfg.safe;
  return (
    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: c.bg, color: c.color }}>
      {level}
    </span>
  );
}

/* ─── Admin Login Gate ─── */
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', 'true');
      onLogin();
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#060B14',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: '#0C1322', border: '1px solid #1A2640', borderRadius: '20px',
        padding: '40px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Lock Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
        }}>
          <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 6px' }}>
          Admin Access
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', margin: '0 0 28px' }}>
          Enter admin credentials to continue.
        </p>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', fontSize: '12px', textAlign: 'center',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" style={INPUT_STYLE}
              onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
              onBlur={e => e.target.style.borderColor = '#1E293B'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={INPUT_STYLE}
              onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
              onBlur={e => e.target.style.borderColor = '#1E293B'}
            />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
            background: '#2563EB', border: 'none', color: 'white', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; }}
          >Sign In</button>
        </form>
      </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
export default function Admin() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    const load = async () => {
      setLoading(true);
      try {
        const [uRes, pRes] = await Promise.all([getAllUsers(), getPosts()]);
        setUsers(uRes.data.data || []);
        setPosts(pRes.data.data || []);
      } catch (err) { console.error('Admin load error:', err); }
      setLoading(false);
    };
    load();
  }, [authenticated]);

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p.post_id !== id));
    } catch (err) { alert('Failed to delete post.'); }
  };

  const handlePostUpdated = (updated) => {
    setPosts(prev => prev.map(p => p.post_id === updated.post_id ? { ...p, ...updated } : p));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
  };

  // ─── LOGIN GATE ───
  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060B14', paddingTop: '80px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ color: '#3B82F6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Administration
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Admin Dashboard</h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Manage users and posts across the platform.
            </p>
          </div>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', cursor: 'pointer', marginTop: '8px',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >Logout</button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Users', value: users.length, icon: '👥' },
            { label: 'Total Posts', value: posts.length, icon: '📝' },
            { label: 'Unsafe Reports', value: posts.filter(p => p.risk_level === 'unsafe').length, icon: '🔴' },
            { label: 'Safe Reports', value: posts.filter(p => p.risk_level === 'safe').length, icon: '🟢' },
          ].map(s => (
            <div key={s.label} style={{
              flex: '1 1 200px', padding: '18px 20px', borderRadius: '14px',
              background: '#0C1322', border: '1px solid #1A2640',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setTab('users')} style={TAB_STYLE(tab === 'users')}>Users ({users.length})</button>
          <button onClick={() => setTab('posts')} style={TAB_STYLE(tab === 'posts')}>Posts ({posts.length})</button>
        </div>

        {/* Content */}
        <div style={{
          background: '#0C1322', border: '1px solid #1A2640', borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spinner" />
            </div>
          ) : tab === 'users' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={HDR}>#</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Name</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Email</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>UID</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.uid || i} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...CELL, color: '#475569', width: '50px' }}>{i + 1}</td>
                      <td style={CELL}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '11px', fontWeight: 700,
                          }}>{(u.name || 'U').charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 500 }}>{u.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td style={{ ...CELL, color: '#94A3B8' }}>{u.email || '—'}</td>
                      <td style={{ ...CELL, color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>{u.uid?.slice(0, 12)}...</td>
                      <td style={{ ...CELL, color: '#94A3B8' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B', fontSize: '14px' }}>No users found.</div>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={HDR}>#</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Title</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Location</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Risk</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Type</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Author</th>
                    <th style={{ ...HDR, textAlign: 'left' }}>Date</th>
                    <th style={{ ...HDR, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p, i) => (
                    <tr key={p.post_id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...CELL, color: '#475569', width: '50px' }}>{i + 1}</td>
                      <td style={{ ...CELL, fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                      <td style={{ ...CELL, color: '#94A3B8', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.location_name || '—'}</td>
                      <td style={CELL}><RiskBadge level={p.risk_level} /></td>
                      <td style={{ ...CELL, color: '#94A3B8' }}>{p.accessibility_type || '—'}</td>
                      <td style={{ ...CELL, color: '#94A3B8' }}>{p.user_name || p.user_id?.slice(0, 8) || '—'}</td>
                      <td style={{ ...CELL, color: '#94A3B8' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td style={{ ...CELL, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingPost(p)} style={{
                            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                            color: '#60A5FA', padding: '5px 12px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                          >Edit</button>
                          <button onClick={() => handleDeletePost(p.post_id)} style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#F87171', padding: '5px 12px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B', fontSize: '14px' }}>No posts found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={(updated) => { handlePostUpdated(updated); setEditingPost(null); }}
        />
      )}
    </div>
  );
}
