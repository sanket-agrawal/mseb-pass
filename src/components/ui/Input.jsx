'use client';

import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  type = 'text',
  className = '',
  id,
  style = {},
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--gray-700)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger-500)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--gray-400)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 2
            }}
          >
            <Icon style={{ width: 18, height: 18 }} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          style={{
            width: '100%',
            padding: Icon ? '10px 12px 10px 40px' : '10px 14px',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-900)',
            backgroundColor: disabled ? 'var(--gray-100)' : 'var(--bg-surface)',
            border: `1.5px solid ${error ? 'var(--danger-500)' : 'var(--gray-200)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-sm)',
            ...style
          }}
          className={className}
          {...props}
        />
      </div>

      {error ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-500)', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
