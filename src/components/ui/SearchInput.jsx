'use client';

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  count,
  countLabel = 'results',
  maxWidth = '450px',
  variant = 'default', // 'default' | 'pill'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  autoFocus = false,
  id,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChange) {
      // Create a synthetic event or call directly
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      };
      onChange(syntheticEvent);
    }
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Size specifications
  const sizeStyles = {
    sm: {
      height: '36px',
      fontSize: 'var(--text-xs, 12px)',
      iconSize: 15,
      paddingLeft: '34px',
      paddingRight: value ? '34px' : '12px'
    },
    md: {
      height: '42px',
      fontSize: 'var(--text-sm, 14px)',
      iconSize: 18,
      paddingLeft: '40px',
      paddingRight: value ? '38px' : '14px'
    },
    lg: {
      height: '48px',
      fontSize: 'var(--text-base, 16px)',
      iconSize: 20,
      paddingLeft: '46px',
      paddingRight: value ? '42px' : '16px'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const borderRadius = variant === 'pill' ? '9999px' : 'var(--radius-lg, 10px)';

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: maxWidth,
        ...style
      }}
      className={`search-input-wrapper ${className}`}
    >
      {/* Search Icon */}
      <div
        style={{
          position: 'absolute',
          left: size === 'sm' ? '10px' : size === 'lg' ? '14px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          color: isFocused ? 'var(--primary-600, #2563eb)' : 'var(--gray-400, #94a3b8)',
          transition: 'color 0.2s ease',
          zIndex: 2
        }}
      >
        <Search style={{ width: currentSize.iconSize, height: currentSize.iconSize }} />
      </div>

      {/* Main Input Element */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          height: currentSize.height,
          paddingLeft: currentSize.paddingLeft,
          paddingRight: count !== undefined && !value ? '85px' : currentSize.paddingRight,
          fontSize: currentSize.fontSize,
          fontWeight: 400,
          color: 'var(--gray-900, #0f172a)',
          backgroundColor: isFocused ? '#ffffff' : 'var(--bg-surface, #ffffff)',
          border: `1.5px solid ${isFocused ? 'var(--primary-500, #3b82f6)' : 'var(--gray-200, #e2e8f0)'}`,
          borderRadius: borderRadius,
          outline: 'none',
          boxShadow: isFocused
            ? '0 0 0 4px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box'
        }}
        {...props}
      />

      {/* Right Side: Clear Button or Count Badge */}
      <div
        style={{
          position: 'absolute',
          right: size === 'sm' ? '8px' : '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 2
        }}
      >
        {/* Result count badge if specified and search active */}
        {count !== undefined && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '9999px',
              backgroundColor: value ? 'var(--primary-50, #eff6ff)' : 'var(--gray-100, #f1f5f9)',
              color: value ? 'var(--primary-700, #1d4ed8)' : 'var(--gray-500, #64748b)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            {count} {countLabel}
          </span>
        )}

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: size === 'sm' ? '20px' : '24px',
              height: size === 'sm' ? '20px' : '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--gray-100, #f1f5f9)',
              color: 'var(--gray-500, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-200, #e2e8f0)';
              e.currentTarget.style.color = 'var(--gray-800, #1e293b)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-100, #f1f5f9)';
              e.currentTarget.style.color = 'var(--gray-500, #64748b)';
            }}
          >
            <X style={{ width: size === 'sm' ? 12 : 14, height: size === 'sm' ? 12 : 14 }} />
          </button>
        )}
      </div>
    </div>
  );
}
