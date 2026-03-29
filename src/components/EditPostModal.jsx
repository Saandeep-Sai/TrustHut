import { useState } from 'react';
import { updatePost } from '../services/api';

const RISK_OPTIONS = ['safe', 'moderate', 'unsafe'];
const TYPE_OPTIONS = ['wheelchair', 'elder', 'general'];

const INPUT_STYLE = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  background: '#020617', border: '1px solid #1E293B', borderRadius: '10px',
  color: '#E2E8F0', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const SELECT_STYLE = {
  ...INPUT_STYLE, cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748B' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
};

export default function EditPostModal({ post, onClose, onUpdated }) {
  const [title, setTitle] = useState(post.title || '');
  const [description, setDescription] = useState(post.description || '');
  const [riskLevel, setRiskLevel] = useState(post.risk_level || 'safe');
  const [accessibilityType, setAccessibilityType] = useState(post.accessibility_type || 'general');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updatePost(post.post_id, {
        title: title.trim(),
        description: description.trim(),
        risk_level: riskLevel,
        accessibility_type: accessibilityType,
      });
      onUpdated({
        ...post,
        title: title.trim(),
        description: description.trim(),
        risk_level: riskLevel,
        accessibility_type: accessibilityType,
      });
      onClose();
    } catch (err) {
      setError('Failed to update post. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', animation: 'fadeIn 0.15s ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '480px',
        background: '#0F172A', border: '1px solid #1E293B', borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #1E293B',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Edit Report</h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: '12px',
            }}>{error}</div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={INPUT_STYLE} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Risk Level</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} style={SELECT_STYLE}>
                {RISK_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>Accessibility Type</label>
              <select value={accessibilityType} onChange={e => setAccessibilityType(e.target.value)} style={SELECT_STYLE}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B',
              color: '#94A3B8', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: saving ? '#1E40AF' : '#2563EB', border: 'none',
              color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
