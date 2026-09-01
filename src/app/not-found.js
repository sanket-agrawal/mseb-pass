'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Zap, ArrowLeft, Home, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-sans)',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          maxWidth: 480,
          backgroundColor: '#1e293b',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          border: '1px solid #334155',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--accent-500)',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <Zap style={{ width: 36, height: 36, fill: 'currentColor' }} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: 'var(--accent-400)' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 12px 0', color: '#ffffff' }}>
          Page or Gate Pass Not Found
        </h2>

        <p style={{ fontSize: 'var(--text-sm)', color: '#94a3b8', marginBottom: '2rem' }}>
          The requested page URL or gate pass ID could not be located in the system registry.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="accent" icon={Home}>
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/gatepass" style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon={FileText}>
              Gate Pass Directory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
