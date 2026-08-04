'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, PlusCircle, Users, Download } from 'lucide-react';

const mobileNavItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Passes', href: '/gatepass', icon: FileText },
  { label: 'New', href: '/gatepass/new', icon: PlusCircle },
  { label: 'Contractors', href: '/contractors', icon: Users },
  { label: 'Export', href: '/export', icon: Download },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon style={{ width: 20, height: 20 }} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
