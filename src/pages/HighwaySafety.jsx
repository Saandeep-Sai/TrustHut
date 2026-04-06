import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { getHighwayRisks } from '../services/api';

// Stable reference — must be outside component
const GOOGLE_MAPS_LIBRARIES = ['geometry'];

// ── Highway route definitions — GPS coordinates traced along actual road centerlines ──
// Each entry has: origin, destination, and waypoints (all on the road itself).
// String addresses auto-snap to road; lat/lng fall back if needed.
const HIGHWAY_ROUTES = {


  // NH-65: Correct Hyderabad city section — Lakdikapool → Koti → Malakpet → Dilsukhnagar → LB Nagar
  // This is the actual road labeled NH-65 on Google Maps (south-east corridor, NOT the Kukatpally route)
  'NH-65': {
    origin:      { lat: 17.3934, lng: 78.4617 },   // Lakdikapool (NH-65 city entry from west)
    destination: { lat: 17.3472, lng: 78.5506 },   // LB Nagar X Roads
    waypoints: [
      { lat: 17.3847, lng: 78.4875 },   // Koti (NH-65 road shield visible here)
      { lat: 17.3713, lng: 78.5010 },   // Malakpet (NH-65 marked)
      { lat: 17.3686, lng: 78.5303 },   // Dilsukhnagar (NH-65 marked)
    ],
  },

  // NH-65 (LB Nagar) — Dilsukhnagar to LB Nagar X Roads short stretch
  'NH-65 (LB Nagar)': {
    origin:      { lat: 17.3686, lng: 78.5303 },   // Dilsukhnagar
    destination: { lat: 17.3472, lng: 78.5506 },   // LB Nagar X Roads
    waypoints: [
      { lat: 17.3570, lng: 78.5420 },   // Saroornagar side
    ],
  },


  // Outer Ring Road — Patancheru Exit 14 clockwise to Ghatkesar
  'Outer Ring Road (ORR)': {
    origin:      'ORR Exit 1, Patancheru, Hyderabad',
    destination: 'ORR Exit 18, Ghatkesar, Hyderabad',
    waypoints: [
      'ORR Miyapur Toll Plaza, Hyderabad',
      'ORR Kompally Toll Plaza, Hyderabad',
      'ORR Shamirpet, Hyderabad',
      'ORR Uppal Toll Plaza, Hyderabad',
    ],
  },

  // ORR Miyapur segment
  'ORR (Miyapur Section)': {
    origin:      { lat: 17.4973, lng: 78.3568 },   // Miyapur ORR ramp
    destination: { lat: 17.5662, lng: 78.3698 },   // Miyapur ORR northern point
    waypoints: [
      { lat: 17.5140, lng: 78.3532 },
      { lat: 17.5400, lng: 78.3590 },
    ],
  },

  // PVNR Expressway — Mehdipatnam flyover to Shamshabad (Airport Expressway)
  // Carefully traced: waypoints are on the expressway, not parallel service roads
  'PVNR Expressway': {
    origin:      { lat: 17.3963, lng: 78.4483 },   // Mehdipatnam flyover ramp
    destination: { lat: 17.2755, lng: 78.4211 },   // Shamshabad, near airport
    waypoints: [
      { lat: 17.3836, lng: 78.4440 },   // PVNR near Kishan Bagh
      { lat: 17.3667, lng: 78.4392 },   // Rajendra Nagar / Attapur stretch
      { lat: 17.3414, lng: 78.4254 },   // Shamshabad ORR flyover
    ],
  },

  // Airport Road — Mehdipatnam to Rajiv Gandhi International Airport
  'Airport Road': {
    origin:      'Mehdipatnam, Hyderabad',
    destination: 'Rajiv Gandhi International Airport, Hyderabad',
    waypoints: [
      'Attapur, Hyderabad',
      'Shamshabad, Hyderabad',
    ],
  },

  // Attapur–Mehdipatnam Road
  'Attapur–Mehdipatnam Road': {
    origin:      { lat: 17.3742, lng: 78.4389 },   // Attapur Bridge
    destination: { lat: 17.3975, lng: 78.4477 },   // Mehdipatnam flyover
    waypoints: [
      { lat: 17.3850, lng: 78.4410 },
    ],
  },

  // Tolichowki–Mehdipatnam Road
  'Tolichowki–Mehdipatnam Rd': {
    origin:      { lat: 17.4046, lng: 78.4218 },   // Tolichowki underpass
    destination: { lat: 17.3975, lng: 78.4477 },   // Mehdipatnam
    waypoints: [
      { lat: 17.4010, lng: 78.4345 },
    ],
  },

  // Gachibowli–Financial District
  'Gachibowli–Financial District Road': {
    origin:      { lat: 17.4401, lng: 78.3489 },   // Gachibowli circle
    destination: { lat: 17.4183, lng: 78.3453 },   // Financial District gate
    waypoints: [
      { lat: 17.4290, lng: 78.3465 },
    ],
  },

  // Kukatpally Main Road — Y-Junction to KPHB end
  'Kukatpally Main Road': {
    origin:      { lat: 17.4948, lng: 78.3996 },   // Kukatpally Y-Junction
    destination: { lat: 17.4768, lng: 78.4165 },   // KPHB Phase-6
    waypoints: [
      { lat: 17.4880, lng: 78.4080 },
    ],
  },

  // Uppal–Nagole Road
  'Uppal–Nagole Road': {
    origin:      'Uppal Bus Stand, Hyderabad',
    destination: 'Nagole Metro Station, Hyderabad',
    waypoints: [],
  },

  // Madhapur Main Road — Madhapur to Hitech City
  'Madhapur Main Road': {
    origin:      { lat: 17.4486, lng: 78.3880 },   // Madhapur Nandagiri Hills
    destination: { lat: 17.4493, lng: 78.3763 },   // Hitech City junction
    waypoints: [
      { lat: 17.4490, lng: 78.3820 },
    ],
  },

  // Kondapur Main Road
  'Kondapur Main Road': {
    origin:      { lat: 17.4605, lng: 78.3568 },   // Kondapur bus stop
    destination: { lat: 17.4403, lng: 78.3487 },   // Gachibowli circle
    waypoints: [
      { lat: 17.4516, lng: 78.3524 },
    ],
  },

  // Manikonda Road
  'Manikonda Road': {
    origin:      { lat: 17.4074, lng: 78.3936 },   // Manikonda junction
    destination: { lat: 17.3975, lng: 78.4477 },   // Mehdipatnam
    waypoints: [
      { lat: 17.4025, lng: 78.4190 },
    ],
  },

  // Mindspace Road — inside Mindspace tech park corridor
  'Mindspace Road': {
    origin:      { lat: 17.4411, lng: 78.3757 },   // Mindspace main gate
    destination: { lat: 17.4488, lng: 78.3882 },   // Madhapur main road
    waypoints: [],
  },

  // Raj Bhavan Road — Raj Bhavan to Secretariat
  'Raj Bhavan Road': {
    origin:      'Raj Bhavan, Hyderabad',
    destination: 'Telangana Secretariat, Hyderabad',
    waypoints: [],
  },
};

const RISK_CATEGORIES = [
  { key: 'accident',    label: '🚗 Accidents',   color: '#EF4444' },
  { key: 'sharp_turn', label: '↩️ Sharp Turns',  color: '#F59E0B' },
  { key: 'bad_road',   label: '🛣️ Bad Road',     color: '#F97316' },
  { key: 'no_lighting',label: '💡 No Lighting',  color: '#8B5CF6' },
  { key: 'congestion', label: '🚦 Congestion',   color: '#3B82F6' },
];

const RISK_COLORS = { unsafe: '#EF4444', moderate: '#F59E0B', safe: '#10B981' };

const MAP_LIGHT_STYLE = [
  { elementType: 'geometry',           stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry',        stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'water', elementType: 'geometry',       stylers: [{ color: '#c9d6e3' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'poi',                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c0c0c0' }] },
];

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

export default function HighwaySafety() {
  const [risks, setRisks]                   = useState([]);
  const [filtered, setFiltered]             = useState([]);
  const [activeFilters, setActiveFilters]   = useState(new Set());
  const [selectedRisk, setSelectedRisk]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [selectedHighway, setSelectedHighway] = useState('');
  const [routeLoading, setRouteLoading]     = useState(false);
  const [routeError, setRouteError]         = useState('');

  const mapRef               = useRef(null);
  const markersRef           = useRef([]);
  const infoWindowRef        = useRef(null);
  const directionsRendererRef = useRef(null);
  const fallbackPolylineRef  = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // ── Fetch data ──
  useEffect(() => { fetchRisks(); }, []);

  useEffect(() => {
    let base = risks;
    if (selectedHighway) base = risks.filter(r => r.route_name === selectedHighway);
    if (activeFilters.size > 0) base = base.filter(r => activeFilters.has(r.risk_category));
    setFiltered(base);
  }, [activeFilters, risks, selectedHighway]);

  // Re-render markers whenever filtered list changes
  useEffect(() => {
    if (mapRef.current && isLoaded) renderMarkers();
  }, [filtered, isLoaded]);

  // Draw/clear route whenever highway selection changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    if (selectedHighway) {
      drawRoute(selectedHighway);
    } else {
      clearRoute();
      mapRef.current?.panTo(DEFAULT_CENTER);
      mapRef.current?.setZoom(12);
    }
  }, [selectedHighway, isLoaded]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await getHighwayRisks();
      setRisks(res.data.data || []);
    } catch { console.error('Failed to load highway risks'); }
    setLoading(false);
  };

  // Unique highways from data for dropdown
  const highwayOptions = [...new Set(risks.map(r => r.route_name).filter(Boolean))].sort();

  // ── Draw markers for all filtered risks ──
  const renderMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();
    const map = mapRef.current;
    if (!map || !window.google) return;

    const iw = new window.google.maps.InfoWindow();
    infoWindowRef.current = iw;

    filtered.forEach(risk => {
      const color = RISK_COLORS[risk.risk_level] || 'var(--text-muted)';
      const catInfo = RISK_CATEGORIES.find(c => c.key === risk.risk_category);
      const isHighlighted = !!(selectedHighway && risk.route_name === selectedHighway);

      const marker = new window.google.maps.Marker({
        position: { lat: risk.latitude, lng: risk.longitude },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isHighlighted ? 14 : 9,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: isHighlighted ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
          strokeWeight: isHighlighted ? 3 : 1.5,
        },
        title: risk.title,
        zIndex: isHighlighted ? 30 : 10,
        animation: isHighlighted ? window.google.maps.Animation.DROP : null,
      });

      marker.addListener('click', () => {
        setSelectedRisk(risk);
        iw.setContent(`
          <div style="max-width:260px;font-family:Inter,sans-serif;padding:4px;">
            <h4 style="margin:0 0 5px;font-size:13px;font-weight:700;color:var(--border)">${risk.title}</h4>
            <p style="margin:0 0 8px;font-size:11px;color:#64748B">📍 ${risk.location_name || ''}</p>
            <span style="display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;color:white;background:${color}">
              ${risk.risk_level?.toUpperCase() || 'UNKNOWN'}
            </span>
            ${catInfo ? `<span style="display:inline-block;margin-left:4px;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:600;background:${catInfo.color}25;color:${catInfo.color}">${catInfo.label}</span>` : ''}
          </div>
        `);
        iw.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // If a highway is selected, fit map to the hazard markers
    // (The route itself is fitted after Directions API responds)
    if (selectedHighway && filtered.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filtered.forEach(r => bounds.extend({ lat: r.latitude, lng: r.longitude }));
      // Don't fitBounds here — the drawRoute callback will do it after route is drawn
    }
  };

  // ── Draw real road route using Directions API ──
  const drawRoute = useCallback((routeName) => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    const routeDef = HIGHWAY_ROUTES[routeName];
    if (!routeDef) {
      // No predefined route — just show the markers
      clearRoute();
      return;
    }

    clearRoute();
    setRouteLoading(true);
    setRouteError('');

    const dr = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,   // we draw our own styled hazard markers
      preserveViewport: true,  // we handle fitBounds ourselves
      polylineOptions: {
        strokeColor:   '#3B82F6',
        strokeOpacity: 0.9,
        strokeWeight:  7,
        zIndex: 5,
      },
    });
    dr.setMap(map);
    directionsRendererRef.current = dr;

    const ds = new window.google.maps.DirectionsService();
    ds.route(
      {
        origin:      routeDef.origin,
        destination: routeDef.destination,
        waypoints:   (routeDef.waypoints || []).map(wp => ({ location: wp, stopover: false })),
        travelMode:  window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
        region: 'IN',
      },
      (result, status) => {
        setRouteLoading(false);
        if (status === 'OK') {
          // Fit map to the actual route bounds returned by Directions API
          dr.setOptions({ preserveViewport: false });
          dr.setDirections(result);
          // Also extend bounds to include hazard markers
          const currentRisks = risks.filter(r => r.route_name === routeName);
          if (currentRisks.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].legs.forEach(leg => {
              leg.steps.forEach(step => {
                step.path.forEach(pt => bounds.extend(pt));
              });
            });
            currentRisks.forEach(r => bounds.extend({ lat: r.latitude, lng: r.longitude }));
            map.fitBounds(bounds, { top: 110, right: 60, bottom: 60, left: 60 });
          }
        } else {
          // Fallback: draw a polyline through lat/lng waypoints only (skip strings)
          console.warn(`Directions API for "${routeName}" returned: ${status}. Fallback polyline.`);
          dr.setMap(null);
          const latLngPoints = [
            routeDef.origin,
            ...(routeDef.waypoints || []),
            routeDef.destination,
          ].filter(p => p && typeof p === 'object' && 'lat' in p);
          if (latLngPoints.length >= 2) {
            const pl = new window.google.maps.Polyline({
              path: latLngPoints,
              strokeColor:   '#3B82F6',
              strokeOpacity: 0.85,
              strokeWeight:  6,
              geodesic: true,
              zIndex: 5,
            });
            pl.setMap(map);
            fallbackPolylineRef.current = pl;
            // Fit bounds to polyline + hazards
            const bounds = new window.google.maps.LatLngBounds();
            latLngPoints.forEach(p => bounds.extend(p));
            risks.filter(r => r.route_name === routeName).forEach(r =>
              bounds.extend({ lat: r.latitude, lng: r.longitude })
            );
            map.fitBounds(bounds, { top: 110, right: 60, bottom: 60, left: 60 });
          }
          setRouteError('Route path approximated — Directions API unavailable');
        }
      }
    );
  }, [risks]);


  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (fallbackPolylineRef.current) {
      fallbackPolylineRef.current.setMap(null);
      fallbackPolylineRef.current = null;
    }
  };

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const highwayRisksCount = selectedHighway
    ? risks.filter(r => r.route_name === selectedHighway).length
    : 0;

  return (
    <div style={{ paddingTop: '64px', background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* ── Top Control Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', position: 'sticky', top: '64px', zIndex: 20,
      }}>

        {/* Highway Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>🛣️ Route:</span>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedHighway}
              onChange={e => { setSelectedHighway(e.target.value); setSelectedRisk(null); }}
              style={{
                padding: '7px 34px 7px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: selectedHighway ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
                border: `1px solid ${selectedHighway ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                color: selectedHighway ? '#60A5FA' : 'var(--text-primary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: '190px',
                transition: 'all 0.2s',
              }}
            >
              <option value="">All Highways</option>
              {highwayOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="11" height="11" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Hazard badge */}
          {selectedHighway && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '999px',
              background: routeLoading ? 'rgba(100,116,139,0.15)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${routeLoading ? 'rgba(100,116,139,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontSize: '11px', fontWeight: 700,
              color: routeLoading ? 'var(--text-secondary)' : '#F87171',
              transition: 'all 0.3s',
            }}>
              {routeLoading ? '⏳ Drawing route…' : `⚠️ ${highwayRisksCount} hazard${highwayRisksCount !== 1 ? 's' : ''} on this route`}
            </div>
          )}
          {routeError && <span style={{ fontSize: '11px', color: '#F87171' }}>{routeError}</span>}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '22px', background: 'var(--border)', flexShrink: 0 }} />

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filter:</span>
          {RISK_CATEGORIES.map(cat => {
            const active = activeFilters.has(cat.key);
            return (
              <button key={cat.key} onClick={() => toggleFilter(cat.key)} style={{
                padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', border: 'none',
                background: active ? `${cat.color}25` : 'var(--nav-pill-bg)',
                color: active ? cat.color : 'var(--text-muted)',
                outline: active ? `1.5px solid ${cat.color}60` : '1.5px solid transparent',
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right: count */}
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading…' : `${filtered.length} risk${filtered.length !== 1 ? 's' : ''} shown`}
        </div>
      </div>

      {/* ── Map + Detail Panel ── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)', position: 'relative' }}>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={DEFAULT_CENTER}
            zoom={12}
            onLoad={onMapLoad}
            options={{
              styles: MAP_LIGHT_STYLE,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          />

          {/* Route overlay label */}
          {selectedHighway && (
            <div style={{
              position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
              padding: '8px 20px', borderRadius: '999px',
              background: 'rgba(12,19,34,0.92)',
              border: '1px solid rgba(59,130,246,0.4)',
              backdropFilter: 'blur(12px)',
              fontSize: '12px', fontWeight: 700, color: '#60A5FA',
              pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 15,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}>
              🛣️ {selectedHighway}
              {!routeLoading && <span style={{ color: '#F87171', marginLeft: '8px' }}>
                {highwayRisksCount > 0 ? `· ${highwayRisksCount} hazard${highwayRisksCount !== 1 ? 's' : ''} marked` : '· Route shown'}
              </span>}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedRisk && (
          <div style={{
            width: '340px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
            overflowY: 'auto', padding: '20px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {selectedRisk.title}
              </h3>
              <button onClick={() => setSelectedRisk(null)} style={{
                background: 'var(--nav-border)', border: 'none', borderRadius: '7px',
                width: '28px', height: '28px', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px',
              }}>✕</button>
            </div>

            {selectedRisk.media_url && (
              <img src={selectedRisk.media_url} alt=""
                style={{ width: '100%', borderRadius: '10px', marginBottom: '14px', objectFit: 'cover', maxHeight: '200px' }}
              />
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 14px' }}>
              {selectedRisk.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                color: 'white', background: RISK_COLORS[selectedRisk.risk_level] || 'var(--text-muted)',
              }}>
                {selectedRisk.risk_level?.toUpperCase()}
              </span>
              {selectedRisk.risk_category && (() => {
                const cat = RISK_CATEGORIES.find(c => c.key === selectedRisk.risk_category);
                return (
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    color: cat?.color || 'var(--text-secondary)', background: 'var(--nav-border)',
                  }}>
                    {cat?.label || selectedRisk.risk_category}
                  </span>
                );
              })()}
            </div>

            {selectedRisk.route_name && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                🛣️ Route: <span style={{ color: 'var(--text-primary)' }}>{selectedRisk.route_name}</span>
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              📍 {selectedRisk.location_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Reported by {selectedRisk.user_name} · {new Date(selectedRisk.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '24px', zIndex: 10,
        display: 'flex', gap: '12px', padding: '10px 16px', borderRadius: '12px',
        background: 'rgba(12,19,34,0.95)', border: '1px solid var(--border)',
        backdropFilter: 'blur(12px)', flexWrap: 'wrap',
      }}>
        {[{ label: 'High Risk', color: '#EF4444' }, { label: 'Medium', color: '#F59E0B' }, { label: 'Safe', color: '#10B981' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
        {selectedHighway && (
          <>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '22px', height: '5px', borderRadius: '3px', background: '#3B82F6', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>Route path</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
