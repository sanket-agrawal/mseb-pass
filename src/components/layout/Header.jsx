'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, Bell, User } from 'lucide-react';
import Button from '@/components/ui/Button';

const getTitleFromPath = (path) => {
  if (path === '/' || path === '/dashboard') return 'Dashboard';
  if (path === '/gatepass') return 'Gate Passes';
  if (path === '/gatepass/new') return 'Issue New Pass';
  if (path.startsWith('/gatepass/')) return 'Pass Details';
  if (path === '/drivers') return 'Drivers';
  if (path === '/substations') return 'Substations';
  if (path === '/export') return 'Excel Export';
  if (path === '/login') return 'Login';
  return 'MSEB Gate Pass';
};

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <header className="app-header">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
          {title}
        </h1>
      </div>

      {/* Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Search Input Bar (Hidden on small screens < 640px for clean layout) */}
        <div className="header-search-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search style={{ width: 15, height: 15, color: 'var(--gray-400)', position: 'absolute', left: 10, pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: '6px 10px 6px 32px',
              fontSize: 'var(--text-xs)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--gray-50)',
              outline: 'none',
              width: 160,
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        {/* Quick Action Button */}
        {pathname !== '/gatepass/new' && (
          <Link href="/gatepass/new" style={{ textDecoration: 'none' }}>
            <Button variant="accent" size="sm" icon={Plus}>
              <span className="header-btn-text">New Pass</span>
            </Button>
          </Link>
        )}

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            color: 'var(--gray-600)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Bell style={{ width: 18, height: 18 }} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-500)'
            }}
          />
        </button>

        {/* User Avatar Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              fontWeight: 700
            }}
          >
            <User style={{ width: 13, height: 13 }} />
          </div>
          <span className="header-user-name" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-800)', paddingRight: 4 }}>
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
