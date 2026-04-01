import { useState, useRef } from 'react';
import { updatePost } from '../services/api';

const RISK_OPTIONS = ['safe', 'moderate', 'unsafe'];
const TYPE_OPTIONS = ['wheelchair', 'elder', 'general'];
const POST_TYPE_OPTIONS = ['place', 'highway'];
const RISK_CATEGORY_OPTIONS = ['accident', 'sharp_turn', 'bad_road', 'no_lighting', 'congestion'];
const MAX_FILE_SIZE = 750 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Compress image and return base64 data URI */
function compressImage(file, maxDim = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const S = {
  label: {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#64748B', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  input: {
    width: '100%', padding: '10px 14px', fontSize: '13px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px', color: '#E2E8F0', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  select: {
    width: '100%', padding: '10px 14px', fontSize: '13px',
    background: '#0F172A', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px', color: '#E2E8F0', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer',
  },
};

export default function EditPostModal({ post, onClose, onUpdated }) {
  const [title, setTitle] = useState(post.title || '');
  const [description, setDescription] = useState(post.description || '');
  const [locationName, setLocationName] = useState(post.location_name || '');
  const [riskLevel, setRiskLevel] = useState(post.risk_level || 'safe');
  const [accessibilityType, setAccessibilityType] = useState(post.accessibility_type || 'general');
  const [postType, setPostType] = useState(post.post_type || 'place');
  const [riskCategory, setRiskCategory] = useState(post.risk_category || '');
  const [routeName, setRouteName] = useState(post.route_name || '');

  // Image state — start with existing media_url (could be base64 or http URL)
  const [imagePreview, setImagePreview] = useState(post.media_url || null);
  const [newBase64, setNewBase64] = useState(null);   // set only when user picks a new file
  const [imgError, setImgError] = useState('');
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Image file picker ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImgError('Only JPEG, PNG, WebP or GIF images are supported.');
      return;
    }
    if (file.size > MAX_FILE_SIZE * 2) {
      setImgError('Image too large. Please choose one under 1.5 MB.');
      return;
    }
    setImgError('');
    try {
      const b64 = await compressImage(file, 800, 0.72);
      setNewBase64(b64);
      setImagePreview(b64);
    } catch {
      setImgError('Could not process image. Try another file.');
    }
  };

  const handleRemoveImage = () => {
    setNewBase64(null);
    setImagePreview(null);
  };

  // ── Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location_name: locationName.trim(),
        risk_level: riskLevel,
        accessibility_type: accessibilityType,
        post_type: postType,
        risk_category: riskCategory,
        route_name: routeName.trim(),
      };
      // Only send media_url if the admin changed the image
      if (newBase64 !== null) {
        payload.media_url = newBase64;
        payload.media_type = 'image';
      } else if (imagePreview === null && post.media_url) {
        // Admin explicitly removed the image
        payload.media_url = '';
      }

      await updatePost(post.post_id, payload);
      onUpdated({ ...post, ...payload, media_url: imagePreview });
      onClose();
    } catch (err) {
      setError('Failed to update post. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.15s ease-out',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: '#0F172A', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden', margin: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            }}>
              <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white' }}>Edit Report</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#F87171', fontSize: '12px',
            }}>{error}</div>
          )}

          {/* Image Upload */}
          <div>
            <label style={S.label}>Post Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                  padding: '12px',
                }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(59,130,246,0.85)', border: 'none', color: 'white', cursor: 'pointer',
                  }}>
                    📷 Change Image
                  </button>
                  <button type="button" onClick={handleRemoveImage} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(239,68,68,0.8)', border: 'none', color: 'white', cursor: 'pointer',
                  }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '28px', borderRadius: '12px', cursor: 'pointer',
                  background: 'rgba(59,130,246,0.04)',
                  border: '2px dashed rgba(59,130,246,0.25)',
                  color: '#94A3B8', fontSize: '13px', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
              >
                <span style={{ fontSize: '24px' }}>🖼️</span>
                <span>Click to upload image</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>JPEG, PNG, WebP, GIF · max 1.5 MB</span>
              </button>
            )}

            {imgError && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#F87171' }}>{imgError}</p>}
          </div>

          {/* Title */}
          <div>
            <label style={S.label}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={S.input} placeholder="Report title..." />
          </div>

          {/* Description */}
          <div>
            <label style={S.label}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Describe the hazard or issue..."
            />
          </div>

          {/* Location Name */}
          <div>
            <label style={S.label}>Location Name</label>
            <input value={locationName} onChange={e => setLocationName(e.target.value)} style={S.input} placeholder="e.g. Banjara Hills, Hyderabad" />
          </div>

          {/* Row: Risk + Accessibility */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Risk Level</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} style={S.select}>
                {RISK_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Accessibility Type</label>
              <select value={accessibilityType} onChange={e => setAccessibilityType(e.target.value)} style={S.select}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Post Type + Risk Category */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Post Type</label>
              <select value={postType} onChange={e => setPostType(e.target.value)} style={S.select}>
                {POST_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            {postType === 'highway' && (
              <div style={{ flex: 1 }}>
                <label style={S.label}>Risk Category</label>
                <select value={riskCategory} onChange={e => setRiskCategory(e.target.value)} style={S.select}>
                  <option value="">— None —</option>
                  {RISK_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Route Name — only for highway */}
          {postType === 'highway' && (
            <div>
              <label style={S.label}>Route / Highway Name</label>
              <input value={routeName} onChange={e => setRouteName(e.target.value)} style={S.input} placeholder="e.g. NH-65, Outer Ring Road" />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: '#94A3B8', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '10px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              background: saving ? '#1E40AF' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              border: 'none', color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              opacity: saving ? 0.8 : 1,
            }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
