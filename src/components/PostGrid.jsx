// src/components/PostGrid.jsx
import { useState, useRef } from 'react';
import PostCard from './PostCard';

const FILTERS = ['All', 'High Risk', 'Medium Risk', 'Low Risk'];

export default function PostGrid({ posts = [] }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const searchRef = useRef(null);

  // 1️⃣  Risk-level filter
  const riskFiltered = posts.filter((p) => {
    if (activeFilter === 'All')         return true;
    if (activeFilter === 'High Risk')   return ['unsafe', 'high risk'].includes(p.risk_level?.toLowerCase());
    if (activeFilter === 'Medium Risk') return ['moderate', 'medium risk'].includes(p.risk_level?.toLowerCase());
    if (activeFilter === 'Low Risk')    return ['safe', 'low risk'].includes(p.risk_level?.toLowerCase());
    return true;
  });

  // 2️⃣  Area / text search (searches title + location_name + description)
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? riskFiltered.filter(p =>
        (p.title        || '').toLowerCase().includes(q) ||
        (p.location_name|| '').toLowerCase().includes(q) ||
        (p.description  || '').toLowerCase().includes(q)
      )
    : riskFiltered;

  const clearSearch = () => { setSearchQuery(''); searchRef.current?.focus(); };

  return (
    <section style={{ background: '#060B14', padding: '80px 0 96px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* ── Header row ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '24px', marginBottom: '28px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ color: '#3B82F6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
              Community Reports
            </p>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'white', margin: '0 0 8px 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Latest Safety Reports
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
                  color:      activeFilter === f ? 'white'   : '#64748B',
                  border:     `1px solid ${activeFilter === f ? '#2563EB' : '#1E293B'}`,
                  boxShadow:  activeFilter === f ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Area Search Bar ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative', maxWidth: '520px' }}>
            {/* Search icon */}
            <svg
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" fill="none" stroke="#64748B" viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>

            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by area, location or keyword… e.g. Banjara Hills, NH-65"
              style={{
                width: '100%', padding: '11px 44px 11px 42px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${searchQuery ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.09)'}`,
                color: 'white', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
                boxShadow: searchQuery ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; }}
              onBlur={e  => { e.target.style.borderColor = searchQuery ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.09)'; }}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                  width: '24px', height: '24px', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search result summary */}
          {q && (
            <p style={{ margin: '8px 0 0 2px', fontSize: '12px', color: '#64748B' }}>
              {filtered.length === 0
                ? <span>No reports found for <strong style={{ color: '#94A3B8' }}>"{searchQuery}"</strong></span>
                : <span><strong style={{ color: '#94A3B8' }}>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for <strong style={{ color: '#94A3B8' }}>"{searchQuery}"</strong></span>
              }
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: '1px', marginBottom: '36px',
          background: 'linear-gradient(to right, transparent, #1E293B 30%, #1E293B 70%, transparent)',
        }} />

        {/* ── Grid ── */}
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
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>{q ? '🔍' : '📭'}</div>
            <p style={{ color: '#64748B', fontWeight: 500, fontSize: '15px', margin: '0 0 12px 0' }}>
              {q ? `No reports found in "${searchQuery}"` : 'No reports match this filter'}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {q && (
                <button onClick={clearSearch} style={{
                  color: '#3B82F6', background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px',
                }}>
                  Clear search
                </button>
              )}
              {activeFilter !== 'All' && (
                <button onClick={() => setActiveFilter('All')} style={{
                  color: '#64748B', background: 'transparent',
                  border: '1px solid #1E293B',
                  borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px',
                }}>
                  Show all risk levels
                </button>
              )}
            </div>
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