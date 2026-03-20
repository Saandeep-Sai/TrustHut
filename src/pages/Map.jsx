import { useState, useEffect } from 'react';
import { getPosts } from '../services/api';
import MapView from '../components/MapView';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'unsafe', label: 'Unsafe' },
];

export default function MapPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getPosts().then(r => setPosts(r.data.data || [])).catch(() => setPosts([])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.risk_level === filter);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#060B14', paddingTop: '64px' }}>
      {/* Toolbar */}
      <div style={{
        padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1A2640', background: 'rgba(6,11,20,0.95)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="16" height="16" fill="none" stroke="#3B82F6" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0020 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Accessibility Map</span>
          <span style={{
            fontSize: '10px', color: '#64748B', background: 'rgba(255,255,255,0.04)',
            padding: '2px 8px', borderRadius: '999px', fontWeight: 500,
          }}>{filtered.length}</span>
        </div>

        <div style={{
          display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)',
          borderRadius: '999px', padding: '4px', border: '1px solid #1A2640',
        }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
              background: filter === f.key ? '#2563EB' : 'transparent',
              color: filter === f.key ? 'white' : '#64748B',
              boxShadow: filter === f.key ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
              fontFamily: 'inherit',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="spinner" />
          </div>
        ) : (
          <MapView posts={filtered} apiKey={MAPS_API_KEY} />
        )}
      </div>
    </div>
  );
}
