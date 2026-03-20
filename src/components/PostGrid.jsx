// src/components/PostGrid.jsx
import { useState } from 'react';
import PostCard from './PostCard';

const DUMMY_POSTS = [
  { post_id: '1', title: 'Central Park Entrance', description: 'Uneven steps at the main gate make entry very difficult for wheelchair users and elderly visitors.', location_name: 'New York, NY', accessibility_type: 'elder', risk_level: 'unsafe', likes_count: 15 },
  { post_id: '2', title: 'Riverside Mall Elevators', description: 'Elevators on the east wing are frequently out of order with no warning signage or alternative routes.', location_name: 'Chicago, IL', accessibility_type: 'general', risk_level: 'moderate', likes_count: 8 },
  { post_id: '3', title: 'Beach Boardwalk', description: 'Newly installed smooth ramp with proper handrails. Accessible parking is available nearby.', location_name: 'Santa Monica, CA', accessibility_type: 'wheelchair', risk_level: 'safe', likes_count: 23 },
  { post_id: '4', title: 'Downtown Metro Station', description: 'Tactile paving in good condition. Elevator available but requires staff assistance during peak hours.', location_name: 'Boston, MA', accessibility_type: 'wheelchair', risk_level: 'moderate', likes_count: 11 },
  { post_id: '5', title: 'Heritage Museum Entrance', description: 'Historic building with steep steps and no ramp. Accessible side entrance available but poorly marked.', location_name: 'Philadelphia, PA', accessibility_type: 'elder', risk_level: 'unsafe', likes_count: 31 },
  { post_id: '6', title: 'Waterfront Park Trail', description: 'Fully paved, wide paths with rest benches every 200m. Excellent signage throughout.', location_name: 'Seattle, WA', accessibility_type: 'general', risk_level: 'safe', likes_count: 47 },
];

const FILTERS = ['All', 'High Risk', 'Medium Risk', 'Low Risk'];

export default function PostGrid({ posts = [] }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const displayPosts = posts.length > 0 ? posts : DUMMY_POSTS;

  const filtered = displayPosts.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'High Risk') return ['unsafe', 'high risk'].includes(p.risk_level?.toLowerCase());
    if (activeFilter === 'Medium Risk') return ['moderate', 'medium risk'].includes(p.risk_level?.toLowerCase());
    if (activeFilter === 'Low Risk') return ['safe', 'low risk'].includes(p.risk_level?.toLowerCase());
    return true;
  });

  return (
    <section style={{ background: '#060B14', padding: '80px 0 96px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '24px', marginBottom: '40px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ color: '#3B82F6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
              Community Reports
            </p>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'white', margin: '0 0 8px 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Latest Accessibility Reports
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
              Real-world insights from travelers like you.
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '7px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  background: activeFilter === f ? '#2563EB' : 'transparent',
                  color: activeFilter === f ? 'white' : '#64748B',
                  border: `1px solid ${activeFilter === f ? '#2563EB' : '#1E293B'}`,
                  boxShadow: activeFilter === f ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px', marginBottom: '40px',
          background: 'linear-gradient(to right, transparent, #1E293B 30%, #1E293B 70%, transparent)',
        }} />

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: '#64748B', fontWeight: 500, fontSize: '15px', margin: '0 0 12px 0' }}>No reports match this filter</p>
            <button onClick={() => setActiveFilter('All')} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              Clear filter
            </button>
          </div>
        )}

        {/* Load more */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '52px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '12px',
            background: 'transparent', border: '1px solid #1E293B',
            color: '#64748B', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          >
            Load More Reports
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}