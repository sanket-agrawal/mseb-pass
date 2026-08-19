'use client';

import React from 'react';

export default function BarChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ padding: '1rem 0' }}>
      <div className="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: 180, borderBottom: '2px solid var(--gray-200)', paddingBottom: 4 }}>
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 8);

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  marginBottom: 6
                }}
              >
                {item.value}
              </span>

              <div
                style={{
                  width: '100%',
                  maxWidth: 40,
                  height: `${heightPercent}%`,
                  backgroundColor: 'var(--primary-600)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.15)',
                  transition: 'height 0.4s ease'
                }}
              />

              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--gray-600)',
                  marginTop: 8,
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
