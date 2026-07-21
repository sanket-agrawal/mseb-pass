'use client';

import React from 'react';

export default function Select({
  label,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option...',
  id,
  className = '',
  ...props
}) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
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

      <select
        id={selectId}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 'var(--text-sm)',
          color: 'var(--gray-900)',
          backgroundColor: disabled ? 'var(--gray-100)' : 'var(--bg-surface)',
          border: `1px solid ${error ? 'var(--danger-500)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        className={className}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={value}>
              {optLabel}
            </option>
          );
        })}
      </select>

      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-500)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}
