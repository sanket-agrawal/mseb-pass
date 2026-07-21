'use client';

import React from 'react';

export default function PageWrapper({
  title,
  subtitle,
  actions,
  children
}) {
  return (
    <div className="page-container animate-fade-in">
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '1.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div>
            {title && (
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: '4px' }}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
