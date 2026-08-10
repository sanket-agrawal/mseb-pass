'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import MandatoryPasswordModal from '@/components/auth/MandatoryPasswordModal';

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname.startsWith('/gatepass/view/');

  if (isPublicPage) {
    return (
      <main style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-main)' }}>
        {children}
      </main>
    );
  }

  return (
    <div className="app-layout">
      <MandatoryPasswordModal />
      <Sidebar />
      <div className="main-content">
        <Header />
        <main>{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
