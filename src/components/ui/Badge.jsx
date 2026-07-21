'use client';

import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // success | warning | danger | info | neutral | accent
  size = 'md',        // sm | md
  dot = true,
  className = '',
  ...props
}) {
  const variantClass = `badge-${variant}`;

  return (
    <span
      className={`badge ${variantClass} ${className}`}
      style={{
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '11px' : 'var(--text-xs)'
      }}
      {...props}
    >
      {dot && <span className="badge-dot" />}
      <span>{children}</span>
    </span>
  );
}
