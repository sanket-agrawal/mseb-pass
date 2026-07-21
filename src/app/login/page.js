'use client';

import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Lock, Mail, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const handleLogin = (e) => {
    e.preventDefault();
    toast.success('Demonstration Mode: Logged in as Admin');
  };

  return (
    <PageWrapper title="System Authentication">
      <div style={{ maxWidth: 420, margin: '2rem auto' }}>
        <Card style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--accent-500)',
                color: 'var(--primary-900)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}
            >
              <Zap style={{ width: 28, height: 28, fill: 'currentColor' }} />
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>MSEB Gate Pass Portal</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Sign in to manage transformer gate passes</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Email / Substation ID" placeholder="admin@mseb-dondaicha.gov.in" icon={Mail} required />
            <Input label="Password" type="password" placeholder="••••••••" icon={Lock} required />
            <Button variant="primary" type="submit" fullWidth style={{ marginTop: '0.5rem' }}>
              Sign In to Portal
            </Button>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
