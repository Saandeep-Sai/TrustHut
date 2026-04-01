import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { getHighwayRisks } from '../services/api';

const RISK_CATEGORIES = [
  { key: 'accident', label: '🚗 Accidents', color: '#EF4444' },
  { key: 'sharp_turn', label: '↩️ Sharp Turns', color: '#F59E0B' },
  { key: 'bad_road', label: '🛣️ Bad Road', color: '#F97316' },
  { key: 'no_lighting', label: '💡 No Lighting', color: '#8B5CF6' },
  { key: 'congestion', label: '🚦 Congestion', color: '#3B82F6' },
];

const RISK_COLORS = {
  unsafe: '#EF4444',
  moderate: '#F59E0B',
  safe: '#10B981',
};

const containerStyle = { width: '100%', height: 'calc(100vh - 64px)' };
const defaultCenter = { lat: 17.385, lng: 78.4867 }; // Hyderabad

export default function HighwaySafety() {
  const [risks, setRisks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  useEffect(() => {
    if (activeFilters.size === 0) {
      setFiltered(risks);
    } else {
      setFiltered(risks.filter(r => activeFilters.has(r.risk_category)));
    }
  }, [activeFilters, risks]);

  useEffect(() => {
    if (mapRef.current && isLoaded) {
      renderMarkers();
    }
  }, [filtered, isLoaded]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await getHighwayRisks();
      setRisks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load highway risks:', err);
    }
    setLoading(false);
  };

  const renderMarkers = () => {
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();

    const map = mapRef.current;
    if (!map || !window.google) return;

    const iw = new window.google.maps.InfoWindow();
    infoWindowRef.current = iw;

    filtered.forEach(risk => {
      const color = RISK_COLORS[risk.risk_level] || '#64748B';
      const catInfo = RISK_CATEGORIES.find(c => c.key === risk.risk_category);

      const marker = new window.google.maps.Marker({
        position: { lat: risk.latitude, lng: risk.longitude },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: risk.title,
      });

      marker.addListener('click', () => {
        setSelectedRisk(risk);
        iw.setContent(`
          <div style="max-width:260px;font-family:Inter,sans-serif;">
            <h4 style="margin:0 0 4px;font-size:14px;">${risk.title}</h4>
            <p style="margin:0 0 6px;font-size:12px;color:#666;">${risk.location_name || ''}</p>
            <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;color:white;background:${color};">
              ${risk.risk_level?.toUpperCase()}
            </span>
            ${catInfo ? `<span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:999px;font-size:11px;background:${catInfo.color}20;color:${catInfo.color};">${catInfo.label}</span>` : ''}
          </div>
        `);
        iw.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ paddingTop: '64px', background: '#060B14', minHeight: '100vh' }}>
      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
        overflowX: 'auto', background: 'rgba(6,11,20,0.95)', borderBottom: '1px solid #1A2640',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap', marginRight: '4px' }}>
          Filter:
        </span>
        {RISK_CATEGORIES.map(cat => {
          const active = activeFilters.has(cat.key);
          return (
            <button key={cat.key} onClick={() => toggleFilter(cat.key)} style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              border: `1px solid ${active ? cat.color : 'rgba(255,255,255,0.1)'}`,
              background: active ? `${cat.color}20` : 'transparent',
              color: active ? cat.color : '#94A3B8',
            }}>
              {cat.label}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading...' : `${filtered.length} risk${filtered.length !== 1 ? 's' : ''} found`}
        </div>
      </div>

      {/* Map + Side Panel */}
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        <div style={{ flex: 1 }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={defaultCenter}
            zoom={12}
            onLoad={onMapLoad}
            options={{
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#0C1322' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#0C1322' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A2640' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
              ],
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          />
        </div>

        {/* Detail panel */}
        {selectedRisk && (
          <div style={{
            width: '340px', background: '#0C1322', borderLeft: '1px solid #1A2640',
            overflowY: 'auto', padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
                {selectedRisk.title}
              </h3>
              <button onClick={() => setSelectedRisk(null)} style={{
                background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
                fontSize: '18px', lineHeight: 1, padding: '0 4px',
              }}>✕</button>
            </div>

            {selectedRisk.media_url && (
              <img src={selectedRisk.media_url} alt="" style={{
                width: '100%', borderRadius: '10px', marginBottom: '14px', objectFit: 'cover', maxHeight: '200px',
              }} />
            )}

            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 14px' }}>
              {selectedRisk.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                color: 'white', background: RISK_COLORS[selectedRisk.risk_level] || '#64748B',
              }}>
                {selectedRisk.risk_level?.toUpperCase()}
              </span>
              {selectedRisk.risk_category && (
                <span style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                  color: RISK_CATEGORIES.find(c => c.key === selectedRisk.risk_category)?.color || '#94A3B8',
                  background: 'rgba(255,255,255,0.06)',
                }}>
                  {selectedRisk.risk_category.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>

            {selectedRisk.route_name && (
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                🛣️ Route: <span style={{ color: '#CBD5E1' }}>{selectedRisk.route_name}</span>
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              📍 {selectedRisk.location_name}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
              Reported by {selectedRisk.user_name} · {new Date(selectedRisk.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '24px', zIndex: 10,
        display: 'flex', gap: '12px', padding: '10px 16px', borderRadius: '12px',
        background: 'rgba(12,19,34,0.95)', border: '1px solid #1A2640',
        backdropFilter: 'blur(12px)',
      }}>
        {[
          { label: 'High Risk', color: '#EF4444' },
          { label: 'Medium', color: '#F59E0B' },
          { label: 'Safe', color: '#10B981' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
