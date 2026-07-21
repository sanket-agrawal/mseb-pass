import React from 'react';

export const metadata = {
  title: 'MSEB Digital Gate Pass View',
  description: 'Public mobile view for MSEB transformer transport digital gate pass.'
};

export default function PublicGatePassLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        fontFamily: 'var(--font-sans)',
        padding: '1rem 0'
      }}
    >
      {children}
    </div>
  );
}
