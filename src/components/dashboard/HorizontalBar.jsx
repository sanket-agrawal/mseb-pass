'use client';

import React from 'react';

export default function HorizontalBar({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0.5rem 0' }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.name}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{item.count} trips</span>
          </div>

          <div
            style={{
              width: '100%',
              height: 8,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--gray-100)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${item.percentage}%`,
                height: '100%',
                backgroundColor: 'var(--accent-500)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
