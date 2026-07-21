'use client';

import React from 'react';
import Button from './Button';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No Data Found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`card-base ${className}`}
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        backgroundColor: 'var(--bg-surface)'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-100)',
          color: 'var(--accent-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon style={{ width: 28, height: 28 }} />
      </div>

      <div style={{ maxWidth: 400 }}>
        <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          {title}
        </h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
