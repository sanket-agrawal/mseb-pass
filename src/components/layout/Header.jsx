'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getAuthUser } from '@/lib/auth';

const getTitleFromPath = (path) => {
  if (path === '/' || path === '/dashboard') return 'Dashboard';
  if (path === '/gatepass') return 'Gate Passes';
  if (path === '/gatepass/new') return 'Issue New Pass';
  if (path.startsWith('/gatepass/')) return 'Pass Details';
  if (path === '/drivers') return 'Drivers';
  if (path === '/substations') return 'Substations / Offices';
  if (path === '/export') return 'Excel Export';
  if (path === '/settings') return 'System Settings';
  if (path === '/login') return 'Login';
  return 'Digital Gate Pass';
};

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'User' : 'Official';

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
              {displayName[0] || <User style={{ width: 13, height: 13 }} />}
            </div>
            <span className="header-user-name" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-800)', paddingRight: 2 }}>
              {displayName}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
