import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { createPost } from '../services/api';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };
const MAX_FILE_SIZE = 750 * 1024; // ~750 KB raw → ~1 MB base64 (Firestore doc limit)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) { resolve(''); return; }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.length > 0) {
        const preferred = results.find(r =>
          r.types.some(t => ['neighborhood', 'sublocality', 'sublocality_level_1', 'locality', 'premise', 'establishment'].includes(t))
        );
        resolve((preferred || results[0]).formatted_address);
      } else {
        resolve('');
      }
    });
  });
}

/** Compress an image file to a max dimension and quality, returns base64 data URI */
function compressImage(file, maxDim = 800, quality = 0.7) {
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Convert a file to base64 data URI */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CreatePost({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', location_name: '',
    latitude: '', longitude: '',
    accessibility_type: 'general', risk_level: 'safe',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_API_KEY });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const applyLocation = useCallback(async (lat, lng) => {
    setMarkerPos({ lat, lng });
    setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6), location_name: '' }));
    setGeocoding(true);
    const name = await reverseGeocode(lat, lng);
    setGeocoding(false);
    setForm(prev => ({ ...prev, location_name: name || prev.location_name }));
  }, []);

  const handleMapClick = useCallback((e) => {
    applyLocation(e.latLng.lat(), e.latLng.lng());
  }, [applyLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setMapCenter({ lat: coords.latitude, lng: coords.longitude });
        applyLocation(coords.latitude, coords.longitude);
      },
      () => { setLocating(false); setError('Could not get your location.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Media handling ──
  const handleFileSelect = (file) => {
    if (!file) return;
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      setError('Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM) are allowed.');
      return;
    }
    if (isVideo && file.size > MAX_FILE_SIZE) {
      setError('Video too large. Max 750 KB for direct storage. Use a shorter clip.');
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) };
    if (isNaN(payload.latitude) || isNaN(payload.longitude)) {
      setError('Please select a location on the map.'); return;
    }
    if (!mediaFile) {
      setError('Please upload an image or video of the location.'); return;
    }

    setLoading(true);
    try {
      // Convert to base64 — compress images, raw base64 for videos
      let base64;
      if (mediaType === 'image') {
        base64 = await compressImage(mediaFile, 800, 0.7);
      } else {
        base64 = await fileToBase64(mediaFile);
      }

      payload.media_url = base64;
      payload.media_type = mediaType;

      await createPost(payload);
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create report.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    label: {
      display: 'block', fontSize: '11px', fontWeight: 700,
      color: '#64748B', marginBottom: '6px',
      textTransform: 'uppercase', letterSpacing: '0.09em',
    },
    input: {
      width: '100%', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px',
      padding: '9px 12px', color: 'white', fontSize: '13px',
      outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
      fontFamily: 'inherit',
    },
  };

  const focusIn  = e => { e.target.style.borderColor = 'rgba(59,130,246,0.55)'; };
  const focusOut = e => { e.target.style.borderColor = form[e.target.name] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.09)'; };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0C1322', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>New Accessibility Report</h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>Help others by sharing what you found</p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
              color: '#F87171', fontSize: '12px', fontWeight: 500,
            }}>{error}</div>
          )}

          {/* MEDIA UPLOAD */}
          <div>
            <label style={s.label}>
              Upload Photo / Video <span style={{ color: '#EF4444', fontWeight: 400, textTransform: 'none' }}>*</span>
            </label>

            {!mediaPreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#2563EB' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '14px', padding: '32px 16px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: dragOver ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 12px',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" fill="none" stroke="#60A5FA" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>
                  Click to upload or drag & drop
                </p>
                <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>
                  Images auto-compressed • Videos max 750 KB
                </p>
              </div>
            ) : (
              <div style={{
                position: 'relative', borderRadius: '14px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                )}

                {/* Remove button */}
                <button type="button" onClick={removeMedia} style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* File info bar */}
                <div style={{
                  padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontSize: '14px' }}>{mediaType === 'video' ? '🎬' : '📸'}</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mediaFile?.name}
                  </span>
                  <span style={{ color: '#475569', fontSize: '10px', flexShrink: 0 }}>
                    {(mediaFile?.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title */}
          <div>
            <label style={s.label}>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. Broken Footpath near Gate 3"
              style={s.input} onFocus={focusIn} onBlur={focusOut} />
          </div>

          {/* Description */}
          <div>
            <label style={s.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required
              rows={3} placeholder="Describe the accessibility issue in detail..."
              style={{ ...s.input, resize: 'none', lineHeight: 1.6 }}
              onFocus={focusIn} onBlur={focusOut} />
          </div>

          {/* Map section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Pick Location on Map</label>
              <button type="button" onClick={handleUseMyLocation} disabled={locating || !isLoaded} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '999px',
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.28)',
                color: '#60A5FA', fontSize: '11px', fontWeight: 600,
                cursor: (locating || !isLoaded) ? 'not-allowed' : 'pointer',
                opacity: !isLoaded ? 0.5 : 1, transition: 'all 0.2s',
              }}>
                {locating ? (
                  <><Spinner size={10} /> Locating…</>
                ) : (
                  <>
                    <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                    Use My Location
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 8px 0' }}>
              Click anywhere on the map — coordinates &amp; address will auto-fill instantly.
            </p>

            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: '220px' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  zoom={13} center={mapCenter} onClick={handleMapClick}
                  options={{
                    styles: [
                      { elementType: 'geometry', stylers: [{ color: '#0f1629' }] },
                      { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1629' }] },
                      { elementType: 'labels.text.fill', stylers: [{ color: '#6b7a99' }] },
                      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2a42' }] },
                      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a9bbf' }] },
                      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080f1e' }] },
                      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                      { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#162030' }] },
                      { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1e2d4a' }] },
                    ],
                    disableDefaultUI: true, zoomControl: true,
                    streetViewControl: false, mapTypeControl: false, fullscreenControl: false,
                  }}
                >
                  {markerPos && (
                    <Marker position={markerPos} icon={{
                      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                      fillColor: '#2563EB', fillOpacity: 1,
                      strokeColor: '#ffffff', strokeWeight: 2,
                      scale: 1.8, anchor: { x: 12, y: 22 },
                    }} />
                  )}
                </GoogleMap>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0F1629' }}>
                  <Spinner size={24} />
                </div>
              )}
            </div>

            {geocoding && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px',
                padding: '8px 12px', background: 'rgba(59,130,246,0.07)',
                border: '1px solid rgba(59,130,246,0.18)', borderRadius: '8px',
              }}>
                <Spinner size={12} />
                <span style={{ fontSize: '12px', color: '#60A5FA' }}>Looking up address…</span>
              </div>
            )}

            {markerPos && !geocoding && form.location_name && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px',
                padding: '8px 12px', background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.22)', borderRadius: '8px',
              }}>
                <svg width="14" height="14" fill="none" stroke="#34D399" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '12px', color: '#6EE7B7', lineHeight: 1.5 }}>
                  Address found: <strong style={{ color: '#A7F3D0' }}>{form.location_name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Location name */}
          <div>
            <label style={s.label}>Location Name</label>
            <input name="location_name" value={form.location_name} onChange={handleChange} required
              placeholder={geocoding ? 'Fetching address...' : 'Auto-filled from map, or type manually'}
              style={{ ...s.input, borderColor: form.location_name ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.09)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.55)'; }}
              onBlur={e => { e.target.style.borderColor = form.location_name ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.09)'; }}
            />
          </div>

          {/* Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['latitude', 'longitude'].map(field => (
              <div key={field}>
                <label style={s.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input name={field} value={form[field]} onChange={handleChange} required
                  placeholder="Auto-filled from map"
                  style={{ ...s.input, color: form[field] ? '#93C5FD' : '#64748B' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.55)'; }}
                  onBlur={e => { e.target.style.borderColor = form[field] ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.09)'; }}
                />
              </div>
            ))}
          </div>

          {/* Type + Risk */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={s.label}>Accessibility Type</label>
              <select name="accessibility_type" value={form.accessibility_type} onChange={handleChange}
                style={{ ...s.input, cursor: 'pointer' }}>
                <option value="general">🛗 General / Elevator</option>
                <option value="wheelchair">♿ Wheelchair</option>
                <option value="elder">🦯 Mobility / Elder</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Risk Level</label>
              <select name="risk_level" value={form.risk_level} onChange={handleChange}
                style={{ ...s.input, cursor: 'pointer' }}>
                <option value="safe">🟢 Safe</option>
                <option value="moderate">🟡 Moderate</option>
                <option value="unsafe">🔴 Unsafe</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: '10px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94A3B8'; }}
            >Cancel</button>

            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '11px', borderRadius: '10px',
              background: loading ? 'rgba(37,99,235,0.5)' : '#2563EB',
              border: 'none', color: 'white', fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
            >{loading ? 'Saving…' : 'Create Report'}</button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes cpSpin { to { transform: rotate(360deg); } }
        select option { background: #0C1322; color: white; }
      `}</style>
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <span style={{
      width: `${size}px`, height: `${size}px`, flexShrink: 0,
      border: `${Math.max(2, size / 6)}px solid rgba(59,130,246,0.25)`,
      borderTopColor: '#3B82F6', borderRadius: '50%', display: 'inline-block',
      animation: 'cpSpin 0.75s linear infinite',
    }} />
  );
}