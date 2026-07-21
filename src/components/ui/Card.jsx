'use client';

import React from 'react';

export default function Card({
  children,
  header,
  footer,
  padding = '1.25rem',
  hover = false,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const cardClass = `card-base ${hover ? 'card-hover' : ''} ${className}`;

  return (
    <div
      className={cardClass}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {header && (
        <div
          style={{
            padding: padding,
            borderBottom: '1px solid var(--border-color)',
            fontWeight: 600,
            color: 'var(--gray-900)'
          }}
        >
          {header}
        </div>
      )}

      <div style={{ padding }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: '0.75rem ' + padding,
            backgroundColor: 'var(--gray-50)',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
