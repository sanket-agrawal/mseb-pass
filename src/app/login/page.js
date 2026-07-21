'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';
import { Zap, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@mseb.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      loginUser(email, password);
      toast.success('Welcome back, Admin! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Zap style={{ width: 28, height: 28, fill: 'currentColor' }} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            MSEB Digital Gate Pass
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: '#475569', margin: 0, fontWeight: 600 }}>
            महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्या. (MSEDCL)
          </p>
          <span style={{ fontSize: '11px', color: 'var(--accent-700)', fontWeight: 700, display: 'block', marginTop: 4 }}>
            Sub Division Dondaicha, Dist. Dhule
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
              Email Address / MSEB ID
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail style={{ width: 16, height: 16, color: '#94a3b8', position: 'absolute', left: 12, pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mseb.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  fontSize: 'var(--text-sm)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock style={{ width: 16, height: 16, color: '#94a3b8', position: 'absolute', left: 12, pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  fontSize: 'var(--text-sm)',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ borderRadius: 4 }}
              />
              Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Demo Password is: admin123'); }} style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight style={{ width: 18, height: 18 }} />}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed #cbd5e1',
            fontSize: '11px',
            color: '#475569',
            textAlign: 'center'
          }}
        >
          <strong>Demo Login Credentials:</strong>
          <div style={{ fontFamily: 'var(--font-mono)', marginTop: 2, color: 'var(--primary-700)', fontWeight: 700 }}>
            admin@mseb.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
