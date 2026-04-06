import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { scoreRoutes } from '../services/api';

const ROUTE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
const RISK_COLOR = { unsafe: '#EF4444', moderate: '#F59E0B', safe: '#10B981' };
const RISK_LABEL = { unsafe: '🔴 High Risk', moderate: '🟡 Moderate', safe: '🟢 Safe' };
const CATEGORY_ICON = {
  accident: '🚗', sharp_turn: '↩️', bad_road: '🛣️',
  no_lighting: '💡', congestion: '🚦', '': '📍',
};

const defaultCenter = { lat: 17.385, lng: 78.4867 };

export default function RouteOptimizer() {
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'reports'

  const mapRef = useRef(null);
  const polylineRefs = useRef([]);
  const reportMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  // ── Clear everything from the map ───────────────────────────────────────────
  const clearMap = () => {
    polylineRefs.current.forEach(p => p.setMap(null));
    polylineRefs.current = [];
    reportMarkersRef.current.forEach(m => m.setMap(null));
    reportMarkersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();
  };

  // ── Drop pins for nearby reports of the selected route ──────────────────────
  const drawReportMarkers = (reports, map) => {
    reportMarkersRef.current.forEach(m => m.setMap(null));
    reportMarkersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();

    const iw = new window.google.maps.InfoWindow();
    infoWindowRef.current = iw;

    reports.forEach(r => {
      const color = RISK_COLOR[r.risk_level] || 'var(--text-muted)';
      const marker = new window.google.maps.Marker({
        position: { lat: r.latitude, lng: r.longitude },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: color,
          fillOpacity: 0.92,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: r.title,
        zIndex: 20,
      });

      marker.addListener('click', () => {
        iw.setContent(`
          <div style="max-width:240px;font-family:Inter,sans-serif;padding:2px;">
            <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px;">${r.title}</div>
            <div style="font-size:11px;color:#666;margin-bottom:6px;">📍 ${r.location_name || ''}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span style="padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;color:white;background:${color};">${(r.risk_level || '').toUpperCase()}</span>
              ${r.risk_category ? `<span style="padding:2px 8px;border-radius:999px;font-size:10px;background:#f1f5f9;color:#475569;">${CATEGORY_ICON[r.risk_category] || ''} ${r.risk_category.replace('_', ' ')}</span>` : ''}
            </div>
            <div style="font-size:10px;color:#94a3b8;margin-top:6px;">~${r.distance_m}m from route</div>
          </div>
        `);
        iw.open(map, marker);
      });

      reportMarkersRef.current.push(marker);
    });
  };

  // ── Main search handler ──────────────────────────────────────────────────────
  const findRoutes = async () => {
    if (!startInput.trim() || !endInput.trim()) {
      setError('Please enter both start and end locations.');
      return;
    }
    setError('');
    setLoading(true);
    setRoutes([]);
    clearMap();

    try {
      const ds = new window.google.maps.DirectionsService();
      const result = await ds.route({
        origin: startInput,
        destination: endInput,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      });

      if (!result.routes || result.routes.length === 0) {
        setError('No routes found between these locations.');
        setLoading(false);
        return;
      }

      const routePayload = result.routes.map((route, i) => ({
        polyline: route.overview_polyline,
        summary: route.summary || `Route ${i + 1}`,
        distance: route.legs[0]?.distance?.text || '',
        duration: route.legs[0]?.duration?.text || '',
      }));

      const scoreRes = await scoreRoutes(routePayload);
      const scoredRoutes = scoreRes.data.data || [];

      setRoutes(scoredRoutes);
      setSelectedIdx(0);
      setActiveTab('routes');

      const map = mapRef.current;
      if (map) {
        const bounds = new window.google.maps.LatLngBounds();

        scoredRoutes.forEach((sr, i) => {
          const path = decodePolylineJS(sr.polyline);
          const color = i === 0 ? ROUTE_COLORS[0] : (i === scoredRoutes.length - 1 ? ROUTE_COLORS[2] : ROUTE_COLORS[1]);

          const polyline = new window.google.maps.Polyline({
            path,
            strokeColor: color,
            strokeOpacity: i === 0 ? 1.0 : 0.45,
            strokeWeight: i === 0 ? 7 : 4,
            map,
            zIndex: i === 0 ? 10 : 1,
          });

          polyline.addListener('click', () => highlightRoute(i, scoredRoutes));
          path.forEach(p => bounds.extend(p));
          polylineRefs.current.push(polyline);
        });

        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 380 });

        // Show report markers for the safest (first) route
        if (scoredRoutes[0]?.nearby_reports?.length > 0) {
          drawReportMarkers(scoredRoutes[0].nearby_reports, map);
        }
      }
    } catch (err) {
      console.error('Route error:', err);
      setError(err.message || 'Failed to find routes. Check your locations.');
    }
    setLoading(false);
  };

  function decodePolylineJS(encoded) {
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let shift = 0, result = 0, b;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  }

  const highlightRoute = (idx, routeList) => {
    setSelectedIdx(idx);
    setActiveTab('routes');
    polylineRefs.current.forEach((p, i) => {
      const sel = i === idx;
      p.setOptions({ strokeOpacity: sel ? 1.0 : 0.35, strokeWeight: sel ? 7 : 4, zIndex: sel ? 10 : 1 });
    });
    // Update report markers for the newly selected route
    const list = routeList || routes;
    if (mapRef.current && list[idx]?.nearby_reports) {
      drawReportMarkers(list[idx].nearby_reports, mapRef.current);
    }
  };

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const getRatingColor = (rating) => {
    const map = { 'Very Safe': '#10B981', Safe: '#34D399', Moderate: '#F59E0B', Risky: '#F97316', Dangerous: '#EF4444' };
    return map[rating] || 'var(--text-secondary)';
  };

  const selectedRoute = routes[selectedIdx];

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ paddingTop: '64px', background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px',
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
          <span style={{ color: '#10B981', fontSize: '16px' }}>●</span>
          <input value={startInput} onChange={e => setStartInput(e.target.value)}
            placeholder="Start location (e.g. Hitech City, Hyderabad)"
            onKeyDown={e => e.key === 'Enter' && findRoutes()}
            style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', fontSize: '13px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
          <span style={{ color: '#EF4444', fontSize: '16px' }}>●</span>
          <input value={endInput} onChange={e => setEndInput(e.target.value)}
            placeholder="Destination (e.g. LB Nagar, Hyderabad)"
            onKeyDown={e => e.key === 'Enter' && findRoutes()}
            style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', fontSize: '13px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
        <button onClick={findRoutes} disabled={loading} style={{
          padding: '9px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'var(--border)' : '#2563EB', color: 'white',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)', transition: 'all 0.2s',
        }}>
          {loading ? 'Analyzing…' : '🛡️ Find Safest Route'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 24px', background: 'rgba(239,68,68,0.1)', color: '#F87171', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Map + Panel */}
      <div style={{ display: 'flex', height: 'calc(100vh - 132px)' }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={defaultCenter} zoom={12} onLoad={onMapLoad}
            options={{
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d6e3' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
                { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
                { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
                { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c0c0c0' }] },
              ],
              disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false,
            }}
          />
        </div>

        {/* Side Panel */}
        {routes.length > 0 && (
          <div style={{ width: '380px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              {[
                { key: 'routes', label: '🛡️ Routes', count: routes.length },
                { key: 'reports', label: '⚠️ Reports', count: selectedRoute?.nearby_reports?.length || 0 },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  flex: 1, padding: '12px 8px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                  color: activeTab === tab.key ? '#3B82F6' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === tab.key ? '#3B82F6' : 'transparent'}`,
                }}>
                  {tab.label}
                  <span style={{
                    marginLeft: '6px', padding: '1px 7px', borderRadius: '999px', fontSize: '10px',
                    background: activeTab === tab.key ? '#3B82F620' : 'var(--border)', color: activeTab === tab.key ? '#3B82F6' : 'var(--text-muted)',
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

              {/* ── Routes Tab ── */}
              {activeTab === 'routes' && routes.map((route, i) => {
                const isSelected = i === selectedIdx;
                const ratingColor = getRatingColor(route.safety_rating);
                const routeColor = i === 0 ? ROUTE_COLORS[0] : (i === routes.length - 1 ? ROUTE_COLORS[2] : ROUTE_COLORS[1]);

                return (
                  <div key={i} onClick={() => highlightRoute(i)}
                    style={{
                      padding: '14px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer',
                      border: `1px solid ${isSelected ? routeColor : 'var(--border)'}`,
                      background: isSelected ? `${routeColor}08` : 'var(--bg-input)', transition: 'all 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: routeColor, boxShadow: `0 0 8px ${routeColor}60` }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{route.summary}</span>
                      {i === 0 && (
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, background: '#10B98120', color: '#10B981', letterSpacing: '0.5px' }}>SAFEST</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📏 {route.distance}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏱ {route.duration}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Safety Rating</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: ratingColor }}>{route.safety_rating}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Risk Score</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{route.risk_score}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Reports</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>{route.nearby_reports?.length || 0}</div>
                      </div>
                    </div>

                    {isSelected && (route.high_risk_count > 0 || route.moderate_risk_count > 0) && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {route.high_risk_count > 0 && (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#EF444420', color: '#EF4444' }}>🚫 {route.high_risk_count} High</span>
                        )}
                        {route.moderate_risk_count > 0 && (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#F59E0B20', color: '#F59E0B' }}>⚠️ {route.moderate_risk_count} Moderate</span>
                        )}
                        {route.low_risk_count > 0 && (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: '#10B98120', color: '#10B981' }}>✅ {route.low_risk_count} Safe</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Reports Tab ── */}
              {activeTab === 'reports' && (
                <div>
                  {selectedRoute && (
                    <div style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reports along: </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedRoute.summary}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                        Showing incidents within 500m of the route path
                      </span>
                    </div>
                  )}

                  {(!selectedRoute?.nearby_reports || selectedRoute.nearby_reports.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No reported hazards found near this route!</p>
                    </div>
                  ) : (
                    selectedRoute.nearby_reports.map((r, i) => {
                      const color = RISK_COLOR[r.risk_level] || 'var(--text-muted)';
                      const catIcon = CATEGORY_ICON[r.risk_category] || '📍';
                      return (
                        <div key={i} style={{
                          display: 'flex', gap: '12px', padding: '12px',
                          borderRadius: '10px', marginBottom: '8px',
                          background: 'var(--bg-input)', border: '1px solid var(--border)',
                          cursor: 'pointer', transition: 'border-color 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = color}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          onClick={() => {
                            if (mapRef.current) {
                              mapRef.current.panTo({ lat: r.latitude, lng: r.longitude });
                              mapRef.current.setZoom(16);
                            }
                          }}
                        >
                          {/* Risk dot */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: `${color}20`, border: `2px solid ${color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px',
                          }}>{catIcon}</div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {r.title}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              📍 {r.location_name || 'Hyderabad'}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', background: color }}>
                                {(r.risk_level || '').toUpperCase()}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>~{r.distance_m}m away</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
