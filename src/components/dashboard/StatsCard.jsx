'use client';

import React from 'react';
import Card from '@/components/ui/Card';

export default function StatsCard({
  title,
  marathiTitle,
  value,
  icon: Icon,
  trend,
  color = 'primary', // primary | accent | success | warning
  onClick
}) {
  const colorMap = {
    primary: { bg: 'var(--primary-50)', text: 'var(--primary-600)', border: 'var(--primary-200)' },
    accent: { bg: 'var(--accent-50)', text: 'var(--accent-600)', border: 'var(--accent-200)' },
    success: { bg: 'var(--success-50)', text: 'var(--success-600)', border: 'var(--success-200)' },
    warning: { bg: 'var(--warning-50)', text: 'var(--warning-600)', border: 'var(--warning-200)' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <Card hover onClick={onClick} style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          {marathiTitle && (
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--gray-400)' }}>
              {marathiTitle}
            </span>
          )}
          <h3 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gray-900)', marginTop: 8, letterSpacing: '-0.02em' }}>
            {value}
          </h3>

          {trend && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 6, display: 'block' }}>
              {trend}
            </span>
          )}
        </div>

        {Icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon style={{ width: 24, height: 24 }} />
          </div>
        )}
      </div>
    </Card>
  );
}
