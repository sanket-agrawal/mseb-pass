'use client';

import React from 'react';

export default function DonutChart({ segments = [] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (!segments || segments.length === 0 || total === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>
        No distribution data available
      </div>
    );
  }

  // Calculate SVG stroke-dasharray segments
  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, idx) => {
            const strokeDasharray = `${(segment.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngle;
            currentAngle += (segment.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
            {total}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 600 }}>
            PASSES
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 140 }}>
        {segments.map((segment, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: segment.color, display: 'inline-block' }} />
              <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{segment.label}</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
