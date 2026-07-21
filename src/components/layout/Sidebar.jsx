'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Building2,
  Download,
  Zap,
  ChevronRight
} from 'lucide-react';
import { APP_INFO } from '@/lib/constants';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gate Passes', href: '/gatepass', icon: FileText },
  { label: 'New Gate Pass', href: '/gatepass/new', icon: PlusCircle },
  { label: 'Drivers', href: '/drivers', icon: Users },
  { label: 'Substations', href: '/substations', icon: Building2 },
  { label: 'Export Data', href: '/export', icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--accent-500)',
            color: 'var(--primary-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Zap style={{ width: 24, height: 24, fill: 'currentColor' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            MSEB <span style={{ color: 'var(--accent-400)' }}>Pass</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--gray-300)', fontWeight: 500 }}>
            {APP_INFO.subdivision}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            padding: '0 12px 8px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--gray-400)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#ffffff' : 'var(--gray-300)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-400)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 'var(--text-sm)',
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon style={{ width: 18, height: 18, color: isActive ? 'var(--accent-400)' : 'var(--gray-400)' }} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight style={{ width: 14, height: 14, color: 'var(--accent-400)' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          fontSize: 'var(--text-xs)',
          color: 'var(--gray-400)'
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--gray-200)', marginBottom: 2 }}>
          {APP_INFO.contractor}
        </div>
        <div>Transport Contractor System</div>
      </div>
    </aside>
  );
}
