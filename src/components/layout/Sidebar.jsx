'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Truck,
  Building2,
  FileSpreadsheet,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { logoutUser } from '@/lib/auth';
import { toast } from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gate Passes', href: '/gatepass', icon: FileText },
  { label: 'Issue New Pass', href: '/gatepass/new', icon: PlusCircle },
  { label: 'Drivers', href: '/drivers', icon: Truck },
  { label: 'Substations', href: '/substations', icon: Building2 },
  { label: 'Excel Export', href: '/export', icon: FileSpreadsheet },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap style={{ width: 22, height: 22, color: 'var(--accent-500)', fill: 'currentColor' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            MSEB Gate Pass
          </span>
          <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 600 }}>
            Sub Division Dondaicha
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">MAIN MENU</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/gatepass/new');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding & Logout */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 10
          }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          Sign Out
        </button>

        <div style={{ fontSize: '10px', color: 'var(--gray-400)', textAlign: 'center' }}>
          <div>MSEB Digital Initiative v1.0</div>
          <div style={{ color: 'var(--accent-400)', marginTop: 2 }}>MSEDCL Dondaicha</div>
        </div>
      </div>
    </aside>
  );
}
