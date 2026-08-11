import '@/app/globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { Toaster } from 'react-hot-toast';
import { APP_INFO } from '@/lib/constants';

export const metadata = {
  title: APP_INFO.fullName,
  description: 'Digital Gate Pass Management System for Maharashtra State Electricity Distribution Company',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 100000000, top: 20, right: 20 }}
          toastOptions={{
            duration: 4500,
            style: {
              zIndex: 100000000,
              maxWidth: '450px',
              wordBreak: 'break-word',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            },
          }}
        />
      </body>
    </html>
  );
}
