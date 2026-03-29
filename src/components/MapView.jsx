import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback, useEffect, useRef } from 'react';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 17.385, lng: 78.4867 };

const RISK_MARKER_COLORS = {
  safe: '#22c55e',
  moderate: '#f59e0b',
  unsafe: '#ef4444',
};

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#21262d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d4954' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
];

const LIBRARIES = ['places', 'geocoding'];

export default function MapView({ posts = [], apiKey, onSelectPost, boundaryGeoJSON, fitBounds }) {
  const mapRef = useRef(null);
  const dataLayerRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Pan + zoom the map when fitBounds changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || !fitBounds) return;

    const bounds = new window.google.maps.LatLngBounds(
      { lat: fitBounds.south, lng: fitBounds.west },
      { lat: fitBounds.north, lng: fitBounds.east }
    );
    map.fitBounds(bounds, 40); // 40px padding
  }, [fitBounds, isLoaded]);

  // Manage boundary overlay via Google Maps Data layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    // Remove old data layer completely
    if (dataLayerRef.current) {
      dataLayerRef.current.setMap(null);
      dataLayerRef.current = null;
    }

    if (!boundaryGeoJSON) return;

    const dataLayer = new window.google.maps.Data({ map });

    dataLayer.setStyle({
      strokeColor: '#EF4444',
      strokeWeight: 2.5,
      strokeOpacity: 0.9,
      fillColor: '#EF4444',
      fillOpacity: 0.04,
    });

    try {
      dataLayer.addGeoJson({
        type: 'Feature',
        geometry: boundaryGeoJSON,
      });
    } catch (err) {
      console.error('Failed to add GeoJSON boundary:', err);
    }

    dataLayerRef.current = dataLayer;

    return () => {
      if (dataLayerRef.current) {
        dataLayerRef.current.setMap(null);
        dataLayerRef.current = null;
      }
    };
  }, [boundaryGeoJSON, isLoaded]);

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#060B14' }}>
        <p style={{ color: '#64748B' }}>Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#060B14' }}>
        <div className="spinner" />
      </div>
    );
  }

  const center = posts.length > 0
    ? { lat: posts[0].latitude, lng: posts[0].longitude }
    : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={13}
      center={center}
      onLoad={onLoad}
      options={{
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {posts.map((post) => (
        <Marker
          key={post.post_id}
          position={{ lat: post.latitude, lng: post.longitude }}
          onClick={() => onSelectPost && onSelectPost(post)}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: RISK_MARKER_COLORS[post.risk_level] || '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.5,
            anchor: { x: 12, y: 22 },
          }}
        />
      ))}
    </GoogleMap>
  );
}
