import { useState, useEffect, useRef } from 'react';
import { getPosts } from '../services/api';
import MapView from '../components/MapView';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'unsafe', label: 'Unsafe' },
];

const RISK_COLORS = {
  safe: { bg: 'rgba(16,185,129,0.12)', color: '#34D399' },
  moderate: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D' },
  unsafe: { bg: 'rgba(239,68,68,0.12)', color: '#F87171' },
};

export default function MapPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState(null);
  const [fitBounds, setFitBounds] = useState(null); // {north, south, east, west}
  const [cityName, setCityName] = useState('');
  const [searching, setSearching] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    getPosts()
      .then(r => setPosts(r.data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.risk_level === filter);

  // Point-in-polygon check (ray casting) working with raw GeoJSON [lng, lat] coords
  function pointInRing(lat, lng, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const yi = ring[i][1], xi = ring[i][0]; // [lng, lat]
      const yj = ring[j][1], xj = ring[j][0];
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function isInsideBoundary(lat, lng, geojson) {
    if (!geojson) return true;
    if (geojson.type === 'Polygon') {
      return pointInRing(lat, lng, geojson.coordinates[0]);
    } else if (geojson.type === 'MultiPolygon') {
      return geojson.coordinates.some(poly => pointInRing(lat, lng, poly[0]));
    }
    return true;
  }

  // Filter posts within boundary polygon
  const displayPosts = boundaryGeoJSON
    ? filtered.filter(p => isInsideBoundary(p.latitude, p.longitude, boundaryGeoJSON))
    : filtered;

  // Fetch actual city boundary from OpenStreetMap Nominatim
  // Uses multiple strategies for better accuracy
  async function nominatimSearch(query, extraParams = '') {
    const base = 'https://nominatim.openstreetmap.org/search';
    const params = `q=${encodeURIComponent(query)}&format=json&polygon_geojson=1&polygon_threshold=0.002&limit=5${extraParams}`;
    const res = await fetch(`${base}?${params}`, {
      headers: { 'User-Agent': 'SafeSteps/1.0', 'Accept-Language': 'en' },
    });
    return res.json();
  }

  function pickBestResult(results) {
    // Prefer results that have Polygon/MultiPolygon geometry
    const withBoundary = results.filter(
      r => r.geojson && (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon')
    );
    if (withBoundary.length === 0) return null;

    // Prefer administrative/city results over POIs
    const adminResult = withBoundary.find(r =>
      r.class === 'boundary' || r.class === 'place' || r.type === 'city' ||
      r.type === 'town' || r.type === 'administrative' || r.type === 'suburb' ||
      r.type === 'village' || r.type === 'state' || r.type === 'district'
    );
    return adminResult || withBoundary[0];
  }

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!citySearch.trim()) {
      setBoundaryGeoJSON(null);
      setCityName('');
      return;
    }

    setSearching(true);
    setBoundaryGeoJSON(null);
    setFitBounds(null);

    try {
      // Strategy 1: Search India only (strict — Saidabad should find Hyderabad's Saidabad)
      let results = await nominatimSearch(citySearch.trim(), '&countrycodes=in');
      let best = pickBestResult(results);

      // Strategy 2: If no Indian polygon found, try with ", India" appended
      if (!best) {
        results = await nominatimSearch(`${citySearch.trim()}, India`);
        best = pickBestResult(results);
      }

      // Strategy 3: Search globally as last resort
      if (!best) {
        results = await nominatimSearch(citySearch.trim());
        best = pickBestResult(results);
      }

      if (best) {
        setBoundaryGeoJSON(best.geojson);
        setCityName(best.display_name.split(',').slice(0, 2).join(', '));

        // Pan + zoom the map to the result's bounding box
        if (best.boundingbox) {
          // Nominatim returns [south, north, west, east]
          const [south, north, west, east] = best.boundingbox.map(Number);
          setFitBounds({ north, south, east, west });
        }
      } else {
        alert('Could not find a boundary for this location. Try a more specific name (e.g. "Saidabad, Hyderabad").');
      }
    } catch (err) {
      console.error('Nominatim error:', err);
      alert('Failed to fetch boundary. Please try again.');
    }
    setSearching(false);
  };

  const clearCity = () => {
    setBoundaryGeoJSON(null);
    setFitBounds(null);
    setCityName('');
    setCitySearch('');
  };

  const riskStyle = (level) => RISK_COLORS[level] || { bg: 'rgba(100,116,139,0.12)', color: 'var(--text-secondary)' };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', paddingTop: '64px' }}>
      {/* ─── TOOLBAR ─── */}
      <div style={{
        padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
        gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="16" height="16" fill="none" stroke="#3B82F6" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0020 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Accessibility Map</span>
          <span style={{
            fontSize: '10px', color: 'var(--text-muted)', background: 'var(--nav-pill-bg)',
            padding: '2px 8px', borderRadius: '999px', fontWeight: 500,
          }}>{displayPosts.length}</span>
        </div>

        {/* City search */}
        <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city (e.g. Hyderabad)"
            style={{
              padding: '6px 12px', fontSize: '12px', width: '180px',
              background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" disabled={searching} style={{
            padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
            background: searching ? '#1E40AF' : '#2563EB', border: 'none', color: 'white', cursor: searching ? 'wait' : 'pointer',
          }}>{searching ? '...' : 'Search'}</button>
          {cityName && (
            <button type="button" onClick={clearCity} style={{
              padding: '6px 10px', borderRadius: '8px', fontSize: '11px',
              background: 'var(--nav-pill-bg)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}>Clear</button>
          )}
        </form>

        {/* Risk filters */}
        <div style={{
          display: 'flex', gap: '4px', background: 'var(--bg-card-hover)',
          borderRadius: '999px', padding: '4px', border: '1px solid var(--border)',
        }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
              background: filter === f.key ? '#2563EB' : 'transparent',
              color: filter === f.key ? 'white' : 'var(--text-muted)',
              boxShadow: filter === f.key ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
              fontFamily: 'inherit',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* City highlight badge */}
      {cityName && (
        <div style={{
          padding: '8px 20px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
        }}>
          <span style={{ color: '#F87171', fontWeight: 600 }}>📍 Highlighted:</span>
          <span style={{ color: 'var(--text-primary)' }}>{cityName}</span>
          <span style={{ color: 'var(--text-muted)' }}>— {displayPosts.length} report(s) in this area</span>
        </div>
      )}

      {/* ─── MAP + SIDE PANEL ─── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="spinner" />
            </div>
          ) : (
            <MapView
              posts={displayPosts}
              apiKey={MAPS_API_KEY}
              onSelectPost={setSelectedPost}
              boundaryGeoJSON={boundaryGeoJSON}
              fitBounds={fitBounds}
            />
          )}
        </div>

        {/* ─── SIDE PANEL ─── */}
        {selectedPost && (
          <div ref={panelRef} style={{
            width: '380px', height: '100%', overflow: 'hidden',
            background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.25s ease-out',
            flexShrink: 0,
          }}>
            {/* Panel Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
            }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Report Details</h3>
              <button onClick={() => setSelectedPost(null)} style={{
                background: 'var(--nav-pill-bg)', border: 'none', borderRadius: '8px',
                width: '30px', height: '30px', cursor: 'pointer', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              {/* Media */}
              {selectedPost.media_url && (
                <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--bg-base)' }}>
                  {selectedPost.media_type === 'video' ? (
                    <video src={selectedPost.media_url} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={selectedPost.media_url} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              <div style={{ padding: '20px' }}>
                {/* Title */}
                <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selectedPost.title}
                </h2>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: riskStyle(selectedPost.risk_level).bg,
                    color: riskStyle(selectedPost.risk_level).color,
                  }}>{selectedPost.risk_level}</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(99,102,241,0.12)', color: '#A5B4FC',
                  }}>{selectedPost.accessibility_type || 'general'}</span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {selectedPost.description || 'No description provided.'}
                </p>

                {/* Details Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                  padding: '16px', borderRadius: '12px',
                  background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>{selectedPost.location_name || '—'}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Author</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>{selectedPost.user_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latitude</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedPost.latitude?.toFixed(6)}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Longitude</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedPost.longitude?.toFixed(6)}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Posted</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
