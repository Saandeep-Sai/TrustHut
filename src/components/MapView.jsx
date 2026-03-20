import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 17.385, lng: 78.4867 }; // Hyderabad

const RISK_MARKER_COLORS = {
  safe: '#22c55e',
  moderate: '#f59e0b',
  unsafe: '#ef4444',
};

export default function MapView({ posts = [], apiKey }) {
  const [selected, setSelected] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 rounded-2xl">
        <p className="text-slate-500">Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 rounded-2xl">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const center = posts.length > 0
    ? { lat: posts[0].latitude, lng: posts[0].longitude }
    : defaultCenter;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={13} center={center}>
      {posts.map((post) => (
        <Marker
          key={post.post_id}
          position={{ lat: post.latitude, lng: post.longitude }}
          onClick={() => setSelected(post)}
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

      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-2 max-w-[250px]">
            <h3 className="font-semibold text-sm text-slate-900">{selected.title}</h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{selected.description}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{selected.accessibility_type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selected.risk_level === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                selected.risk_level === 'moderate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>{selected.risk_level}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">📍 {selected.location_name}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
