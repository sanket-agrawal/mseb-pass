'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({
  variant = 'spinner', // spinner | skeleton | skeleton-card | skeleton-table
  text = 'Loading...'
}) {
  if (variant === 'spinner') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '12px',
          color: 'var(--primary-600)'
        }}
      >
        <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
        {text && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton-card') {
    return (
      <div className="card-base p-4" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="skeleton" style={{ height: 24, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '80%' }} />
        <div className="skeleton" style={{ height: 16, width: '60%' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div className="skeleton" style={{ height: 40, width: '100%' }} />
      <div className="skeleton" style={{ height: 40, width: '100%' }} />
      <div className="skeleton" style={{ height: 40, width: '100%' }} />
    </div>
  );
}
