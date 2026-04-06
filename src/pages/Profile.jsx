import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPosts, updateProfile, getPosts } from '../services/api';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [myRes, allRes] = await Promise.all([getUserPosts(), getPosts()]);
        setMyPosts(myRes.data.data || []);
        setLikedPosts(allRes.data.data?.filter(p => p.likes_count > 0) || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { if (profile) setNewName(profile.name || ''); }, [profile]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try { await updateProfile({ name: newName.trim() }); await refreshProfile(); setEditing(false); }
    catch {}
  };

  const handleDelete = (id) => setMyPosts(myPosts.filter(p => p.post_id !== id));
  const activePosts = tab === 'my' ? myPosts : likedPosts;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: '80px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

        {/* Profile Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
          overflow: 'hidden', marginBottom: '32px',
        }}>
          {/* Banner */}
          <div style={{
            height: '100px', position: 'relative',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.08) 100%)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, var(--bg-card), transparent)',
            }} />
          </div>

          <div style={{ padding: '0 28px 28px', marginTop: '-36px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px' }}>
              {/* Avatar */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '18px', flexShrink: 0,
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', fontSize: '28px', fontWeight: 800,
                border: '4px solid var(--bg-card)',
                boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
              }}>
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                {editing ? (
                  <form onSubmit={handleUpdateName} style={{ display: 'flex', gap: '8px' }}>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input" style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }} />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }}>Cancel</button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{profile?.name || 'User'}</h2>
                    <button onClick={() => setEditing(true)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px',
                    }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{myPosts.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>Posts</span>
              </div>
              <div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{likedPosts.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>Likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {['my', 'liked'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}>
              {t === 'my' ? 'My Posts' : 'Liked Posts'}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
        ) : activePosts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {tab === 'my' ? "You haven't created any reports yet." : "No liked reports found."}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: '20px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}>
            {activePosts.map((p, i) => (
              <div key={p.post_id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <PostCard post={p} onDelete={tab === 'my' ? handleDelete : undefined} showActions={tab === 'my'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
