import '@/app/globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
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
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
