'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, Bell, User, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getAuthUser } from '@/lib/auth';

const getTitleFromPath = (path) => {
  if (path === '/' || path === '/dashboard') return 'Dashboard';
  if (path === '/gatepass') return 'Gate Passes';
  if (path === '/gatepass/new') return 'Issue New Pass';
  if (path.startsWith('/gatepass/')) return 'Pass Details';
  if (path === '/drivers') return 'Drivers';
  if (path === '/substations') return 'Substations';
  if (path === '/export') return 'Excel Export';
  if (path === '/settings') return 'System Settings';
  if (path === '/login') return 'Login';
  return 'MSEB Gate Pass';
};

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

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
        {/* Search Input Bar (Hidden on small screens < 640px) */}
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

        {/* User Profile Avatar Link to Settings */}
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
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
              {user?.name?.[0] || <User style={{ width: 13, height: 13 }} />}
            </div>
            <span className="header-user-name" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-800)', paddingRight: 2 }}>
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
