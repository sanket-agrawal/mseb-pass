'use client';

import React, { useState } from 'react';

export default function BarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div style={{ padding: '0.25rem 0' }}>
      {/* Top Legend & Dynamic Hover Information Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '34px',
          padding: '6px 12px',
          marginBottom: '1rem',
          backgroundColor: activeItem ? 'var(--primary-50)' : 'var(--gray-50)',
          border: `1px solid ${activeItem ? 'var(--primary-200)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s ease',
          fontSize: 'var(--text-xs)'
        }}
      >
        {activeItem ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: '8px',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: '13px' }}>
              {activeItem.label}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-700)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#2563eb' }} />
                Outward (जावक):{' '}
                <strong style={{ color: 'var(--primary-700)', fontFamily: 'var(--font-mono)' }}>
                  {activeItem.outward ?? Math.round(activeItem.value * 0.6)}
                </strong>
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-700)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#f59e0b' }} />
                Inward (आवक):{' '}
                <strong style={{ color: 'var(--accent-700)', fontFamily: 'var(--font-mono)' }}>
                  {activeItem.inward ?? (activeItem.value - (activeItem.outward ?? Math.round(activeItem.value * 0.6)))}
                </strong>
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-700)', borderLeft: '1px solid var(--gray-300)', paddingLeft: '10px' }}>
                Total (एकूण):{' '}
                <strong style={{ color: 'var(--gray-900)', fontFamily: 'var(--font-mono)' }}>
                  {activeItem.value}
                </strong>
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-600)', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#2563eb' }} />
                Outward (जावक)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gray-600)', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#f59e0b' }} />
                Inward (आवक)
              </span>
            </div>
            <span style={{ color: 'var(--gray-400)', fontSize: '11px', fontStyle: 'italic' }}>
              Hover on any bar for breakdown
            </span>
          </div>
        )}
      </div>

      {/* Main Chart Bars Container */}
      <div
        className="bar-chart"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '14px',
          height: 180,
          borderBottom: '2px solid var(--gray-200)',
          paddingBottom: 4,
          position: 'relative'
        }}
      >
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const totalVal = item.value || 0;
          const totalHeightPercent = Math.max((totalVal / maxValue) * 100, 6);

          const outwardVal = item.outward !== undefined ? item.outward : Math.round(totalVal * 0.6);
          const inwardVal = item.inward !== undefined ? item.inward : (totalVal - outwardVal);

          const outwardPercent = totalVal > 0 ? (outwardVal / totalVal) * 100 : 50;
          const inwardPercent = totalVal > 0 ? (inwardVal / totalVal) * 100 : 50;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Total Count on Top of Bar */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isHovered ? 800 : 700,
                  color: isHovered ? 'var(--primary-700)' : 'var(--gray-700)',
                  marginBottom: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                {totalVal}
              </span>

              {/* Stacked Bar Container */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 44,
                  height: `${totalHeightPercent}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  overflow: 'hidden',
                  boxShadow: isHovered
                    ? '0 0 0 2px var(--primary-500), 0 4px 12px rgba(37, 99, 235, 0.3)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  transform: isHovered ? 'scaleY(1.02)' : 'none',
                  transformOrigin: 'bottom',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Top Segment: Inward (Amber/Gold) */}
                {inwardVal > 0 && (
                  <div
                    title={`Inward: ${inwardVal}`}
                    style={{
                      height: `${inwardPercent}%`,
                      width: '100%',
                      backgroundColor: isHovered ? '#fbbf24' : '#f59e0b',
                      transition: 'background-color 0.15s ease'
                    }}
                  />
                )}

                {/* Bottom Segment: Outward (Blue) */}
                {outwardVal > 0 && (
                  <div
                    title={`Outward: ${outwardVal}`}
                    style={{
                      height: `${outwardPercent}%`,
                      width: '100%',
                      backgroundColor: isHovered ? '#3b82f6' : '#2563eb',
                      transition: 'background-color 0.15s ease'
                    }}
                  />
                )}
              </div>

              {/* Month Label */}
              <span
                style={{
                  fontSize: '11px',
                  color: isHovered ? 'var(--gray-900)' : 'var(--gray-600)',
                  marginTop: 8,
                  fontWeight: isHovered ? 700 : 600,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease'
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
