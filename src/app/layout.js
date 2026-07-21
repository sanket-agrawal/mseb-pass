import '@/app/globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Toaster } from 'react-hot-toast';
import { APP_INFO } from '@/lib/constants';

export const metadata = {
  title: APP_INFO.fullName,
  description: 'Digital Gate Pass Management System for Maharashtra State Electricity Distribution Company',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main>{children}</main>
          </div>
          <MobileNav />
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
