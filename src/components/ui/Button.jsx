'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost | accent
  size = 'md',        // sm | md | lg
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.2s ease',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.65 : 1,
    whiteSpace: 'nowrap',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary-600)',
      color: '#ffffff',
      borderColor: 'var(--primary-600)',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
    secondary: {
      backgroundColor: 'var(--gray-100)',
      color: 'var(--gray-800)',
      borderColor: 'var(--gray-200)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--primary-700)',
      borderColor: 'var(--primary-300)',
    },
    danger: {
      backgroundColor: 'var(--danger-500)',
      color: '#ffffff',
      borderColor: 'var(--danger-500)',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--gray-700)',
      borderColor: 'transparent',
    },
    accent: {
      backgroundColor: 'var(--accent-500)',
      color: 'var(--gray-900)',
      borderColor: 'var(--accent-600)',
      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
    }
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 'var(--text-xs)', gap: '6px' },
    md: { padding: '8px 16px', fontSize: 'var(--text-sm)', gap: '8px' },
    lg: { padding: '12px 22px', fontSize: 'var(--text-base)', gap: '10px' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  const combinedStyles = {
    ...baseStyles,
    ...currentVariant,
    ...currentSize,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={combinedStyles}
      className={`btn-hover-effect ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
      ) : (
        Icon && iconPosition === 'left' && <Icon style={{ width: size === 'sm' ? 14 : 18, height: size === 'sm' ? 14 : 18 }} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon style={{ width: size === 'sm' ? 14 : 18, height: size === 'sm' ? 14 : 18 }} />
      )}
    </button>
  );
}
