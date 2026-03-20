import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, likePost, unlikePost } from '../services/api';

const RISK_CONFIG = {
  unsafe:      { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#F87171', dot: '#EF4444', label: 'High Risk' },
  moderate:    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#FCD34D', dot: '#F59E0B', label: 'Medium Risk' },
  safe:        { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34D399', dot: '#10B981', label: 'Safe' },
};
const TYPE_EMOJI = { elder: '🦯', wheelchair: '♿', general: '🛗' };
const TYPE_LABEL = { elder: 'Mobility Issue', wheelchair: 'Wheelchair Access', general: 'Elevator Access' };

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    getPost(postId)
      .then(r => { setPost(r.data.data); setLikeCount(r.data.data?.likes_count || 0); })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(p => newLiked ? p + 1 : p - 1);
    try {
      if (newLiked) await likePost(postId);
      else await unlikePost(postId);
    } catch {
      setLiked(!newLiked);
      setLikeCount(p => newLiked ? p - 1 : p + 1);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <p style={{ color: '#64748B', fontSize: '14px' }}>Post not found.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
    </div>
  );

  const risk = RISK_CONFIG[post.risk_level?.toLowerCase()] || RISK_CONFIG.safe;
  const hasMedia = post.media_url && post.media_url.length > 0;
  const isVideo = post.media_type === 'video';
  const mediaSrc = hasMedia ? post.media_url : `https://picsum.photos/seed/${post.post_id}/800/600`;
  const userName = post.user_name || 'Anonymous';
  const created = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#060B14', paddingTop: '72px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748B', fontSize: '13px', marginBottom: '20px', padding: 0,
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {/* Post card */}
        <div style={{
          background: '#0C1322', border: '1px solid #1A2640',
          borderRadius: '20px', overflow: 'hidden',
        }}>

          {/* User header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '15px', fontWeight: 700,
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'white' }}>{userName}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>{created}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '999px',
              background: risk.bg, border: `1px solid ${risk.border}`,
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: risk.dot }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: risk.color }}>{risk.label}</span>
            </div>
          </div>

          {/* Media */}
          <div style={{ width: '100%', background: '#080E1A' }}>
            {isVideo && hasMedia ? (
              <video src={mediaSrc} controls playsInline style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }} />
            ) : (
              <img src={mediaSrc} alt={post.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }} />
            )}
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '14px 20px' }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: liked ? '#F43F5E' : '#94A3B8', transition: 'color 0.15s',
            }}>
              <svg width="22" height="22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}
                style={{ transform: liked ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{likeCount} likes</span>
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8',
            }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Share</span>
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '0 20px 24px' }}>
            {/* Title */}
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 12px', lineHeight: 1.3 }}>{post.title}</h1>

            {/* Description */}
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.8, margin: '0 0 20px', whiteSpace: 'pre-line' }}>
              {post.description}
            </p>

            {/* Details grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
              padding: '16px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <DetailItem icon="📍" label="Location" value={post.location_name} />
              <DetailItem
                icon={TYPE_EMOJI[post.accessibility_type] || '📋'}
                label="Type"
                value={TYPE_LABEL[post.accessibility_type] || post.accessibility_type}
              />
              <DetailItem
                icon="🌍"
                label="Coordinates"
                value={post.latitude && post.longitude ? `${Number(post.latitude).toFixed(4)}, ${Number(post.longitude).toFixed(4)}` : 'N/A'}
              />
              <DetailItem
                icon={risk.dot === '#EF4444' ? '🔴' : risk.dot === '#F59E0B' ? '🟡' : '🟢'}
                label="Risk Level"
                value={risk.label}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{icon} {label}</span>
      <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
