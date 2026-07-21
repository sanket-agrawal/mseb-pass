'use client';

import React from 'react';

const presets = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'last3months', label: 'Last 3 Months' },
];

export default function DateRangeSelector({ value = 'all', onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        backgroundColor: 'var(--gray-100)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap'
      }}
    >
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange && onChange(p.id)}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: value === p.id ? 'var(--bg-surface)' : 'transparent',
            color: value === p.id ? 'var(--primary-700)' : 'var(--gray-600)',
            boxShadow: value === p.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
