import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, unlikePost, deletePost, getComments, addComment, deleteComment as deleteCommentApi } from '../services/api';
import EditPostModal from './EditPostModal';

const RISK_CONFIG = {
  unsafe:      { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#F87171', dot: '#EF4444', label: 'High Risk' },
  'high risk': { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#F87171', dot: '#EF4444', label: 'High Risk' },
  moderate:      { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#FCD34D', dot: '#F59E0B', label: 'Medium' },
  'medium risk': { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#FCD34D', dot: '#F59E0B', label: 'Medium' },
  safe:       { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34D399', dot: '#10B981', label: 'Safe' },
  'low risk': { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34D399', dot: '#10B981', label: 'Safe' },
};

const TYPE_EMOJI = { elder: '🦯', wheelchair: '♿', general: '🛗' };
const TYPE_LABEL = { elder: 'Mobility Issue', wheelchair: 'Wheelchair Access', general: 'Elevator Access' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post: initialPost, onDelete, onUpdate }) {
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost.likes_count || 0);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const menuRef = useRef(null);

  const isOwner = user && post.user_id === user.uid;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const risk = RISK_CONFIG[post.risk_level?.toLowerCase()] || {
    bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)',
    color: 'var(--text-secondary)', dot: 'var(--text-muted)', label: 'Unknown',
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(p => newLiked ? p + 1 : p - 1);
    try {
      if (newLiked) await likePost(post.post_id);
      else await unlikePost(post.post_id);
    } catch {
      setLiked(!newLiked);
      setLikeCount(p => newLiked ? p - 1 : p + 1);
    }
  };

  const toggleComments = async () => {
    const opening = !commentsOpen;
    setCommentsOpen(opening);
    if (opening) {
      setLoadingComments(true);
      try {
        const res = await getComments(post.post_id);
        const data = res.data.data || [];
        setComments(data);
        setCommentCount(data.length);
      } catch { setComments([]); }
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      const res = await addComment(post.post_id, commentText.trim());
      setComments(prev => [...prev, res.data.data]);
      setCommentCount(prev => prev + 1);
      setCommentText('');
    } catch { alert('Failed to post comment.'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      setCommentCount(prev => prev - 1);
    } catch { alert('Failed to delete comment.'); }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.post_id}`;
    const shareData = { title: post.title, text: post.description?.slice(0, 100), url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }
    } catch { await navigator.clipboard.writeText(url); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deletePost(post.post_id);
      if (onDelete) onDelete(post.post_id);
    } catch { alert('Failed to delete.'); }
  };

  const handleUpdated = (updatedPost) => {
    setPost(updatedPost);
    if (onUpdate) onUpdate(updatedPost);
  };

  const hasMedia = post.media_url && post.media_url.length > 0;
  const isVideo = post.media_type === 'video';
  const mediaSrc = hasMedia ? post.media_url : `https://picsum.photos/seed/${post.post_id}/600/400`;
  const userName = post.user_name || 'Anonymous';
  const desc = post.description || '';
  const showReadMore = desc.length > 120 && !expanded;

  return (
    <>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>

        {/* ─── USER HEADER ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700,
          }}>{userName.charAt(0).toUpperCase()}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{userName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <svg width="10" height="10" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.location_name}
              </span>
            </div>
          </div>

          {/* Risk badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '999px',
            background: risk.bg, border: `1px solid ${risk.border}`,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: risk.dot }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: risk.color }}>{risk.label}</span>
          </div>

          {/* ⋯ Owner menu */}
          {isOwner && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                color: 'var(--text-muted)', fontSize: '18px', fontWeight: 700, lineHeight: 1,
              }}>⋯</button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 100,
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px',
                  boxShadow: '0 8px 24px var(--shadow-card)', minWidth: '130px', overflow: 'hidden',
                }}>
                  <button onClick={() => { setMenuOpen(false); setEditing(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none',
                    color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left', borderBottom: '1px solid var(--border)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--nav-pill-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={handleDelete} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none',
                    color: '#F87171', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── MEDIA ─── */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--bg-base)', overflow: 'hidden' }}>
          {isVideo && hasMedia ? (
            <video src={mediaSrc} controls playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={mediaSrc} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px',
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px', borderRadius: '999px',
            background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)',
            color: 'white', fontSize: '11px', fontWeight: 500,
          }}>
            {TYPE_EMOJI[post.accessibility_type] || '📍'} {TYPE_LABEL[post.accessibility_type] || 'Accessibility'}
          </div>
          {isVideo && hasMedia && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(0,0,0,0.6)', color: 'white',
              fontSize: '10px', fontWeight: 700, backdropFilter: 'blur(8px)',
            }}>
              <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              VIDEO
            </div>
          )}
        </div>

        {/* ─── ACTION BAR ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px' }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: liked ? '#F43F5E' : 'var(--text-secondary)', transition: 'color 0.15s ease',
          }}>
            <svg width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}
              style={{ transform: liked ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s ease' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{likeCount}</span>
          </button>
          <button onClick={toggleComments} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: commentsOpen ? '#3B82F6' : 'var(--text-secondary)', transition: 'color 0.15s',
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            {commentCount > 0 && <span style={{ fontSize: '13px', fontWeight: 600 }}>{commentCount}</span>}
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={handleShare} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)',
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
            {shareToast && (
              <div style={{
                position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                background: '#10B981', color: 'white', whiteSpace: 'nowrap',
                animation: 'fadeIn 0.2s ease',
              }}>Link copied!</div>
            )}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-dim)' }}>{timeAgo(post.created_at)}</span>
        </div>

        {/* ─── CAPTION ─── */}
        <div style={{ padding: '0 16px 14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>{post.title}</h3>
          <p style={{
            fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0,
            ...(showReadMore ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}),
          }}>{desc}</p>
          {showReadMore && (
            <button onClick={() => setExpanded(true)} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px',
            }}>... more</button>
          )}
          <button onClick={() => navigate(`/post/${post.post_id}`)} style={{
            display: 'block', marginTop: '10px', background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', color: '#3B82F6', fontSize: '12px', fontWeight: 500,
          }}>View full details →</button>
        </div>

        {/* ─── COMMENTS SECTION ─── */}
        {commentsOpen && (
          <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
            {loadingComments ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '10px 0' }}>Loading comments...</p>
            ) : (
              <>
                {comments.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', padding: '10px 0', margin: 0 }}>No comments yet.</p>
                )}
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                  {comments.map(c => (
                    <div key={c.comment_id} style={{
                      display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '11px', fontWeight: 700,
                      }}>{(c.user_name || 'U').charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.user_name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{timeAgo(c.created_at)}</span>
                          {user && c.user_id === user.uid && (
                            <button onClick={() => handleDeleteComment(c.comment_id)} style={{
                              marginLeft: 'auto', background: 'none', border: 'none',
                              color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer',
                            }}>✕</button>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {user && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      value={commentText} onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment..." maxLength={1000}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                        background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none',
                      }}
                    />
                    <button onClick={handleAddComment} disabled={!commentText.trim()} style={{
                      padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      border: 'none', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                      background: commentText.trim() ? '#2563EB' : 'var(--border)', color: 'white',
                    }}>Post</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && <EditPostModal post={post} onClose={() => setEditing(false)} onUpdated={handleUpdated} />}
    </>
  );
}