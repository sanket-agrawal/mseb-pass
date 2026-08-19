'use client';

import React, { useState, useEffect } from 'react';
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
  Users,
  Boxes,
  LogOut,
  Zap
} from 'lucide-react';
import {
  logoutUser,
  getAuthUser,
  canCreateGatePass,
  canManageContractors,
  canManageStations,
  canManageUsers,
  canManageAssets
} from '@/lib/auth';
import { toast } from 'react-hot-toast';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(() => getAuthUser());
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  const confirmLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    router.replace('/login');
  };



  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { label: 'Gate Passes', href: '/gatepass', icon: FileText, show: true },
    { label: 'Issue New Pass', href: '/gatepass/new', icon: PlusCircle, show: canCreateGatePass(user) },
    { label: 'Asset Management', href: '/assets', icon: Boxes, show: canManageAssets(user) },
    { label: 'Contractors', href: '/contractors', icon: Truck, show: canManageContractors(user) },
    { label: 'Substations & Offices', href: '/substations', icon: Building2, show: canManageStations(user) },
    { label: 'Employee Management', href: '/users', icon: Users, show: canManageUsers(user) },
    { label: 'Excel Export', href: '/export', icon: FileSpreadsheet, show: true },
    { label: 'Settings', href: '/settings', icon: Settings, show: true },
  ].filter(item => item.show);

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap style={{ width: 22, height: 22, color: 'var(--accent-500)', fill: 'currentColor' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            MSEB Gate Pass
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-400)', fontWeight: 700 }}>
            Dondaicha Division
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
          onClick={() => setShowLogoutModal(true)}
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

        <div style={{ fontSize: '10px', color: 'var(--gray-400)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div>MSEB Digital Initiative</div>
          <div style={{ color: 'var(--accent-400)', fontWeight: 700 }}>Dondaicha Division</div>
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
            Are you sure you want to log out of the <strong>MSEB Digital Gate Pass System</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={LogOut} onClick={confirmLogout}>
              Sign Out Now
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
