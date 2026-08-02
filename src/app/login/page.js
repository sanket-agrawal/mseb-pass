'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithPassword, requestOTP, verifyOTP } from '@/lib/auth';
import { Zap, Eye, EyeOff, Lock, Mail, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'otp'

  // Password state
  const [identifier, setIdentifier] = useState('admin@mseb.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginWithPassword(identifier, password);
      toast.success(`Welcome back, ${user.first_name || 'User'}!`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);

    try {
      const data = await requestOTP(mobile);
      setOtpSent(true);
      if (data.otp) {
        toast.success(`OTP sent! (Dev OTP: ${data.otp})`);
      } else {
        toast.success('OTP sent to your mobile & WhatsApp!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);

    try {
      const user = await verifyOTP(mobile, otp);
      toast.success(`Welcome back, ${user.first_name || 'User'}!`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
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
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
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
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setOtpSent(false); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'password' ? '#ffffff' : 'transparent',
              color: activeTab === 'password' ? 'var(--primary-600)' : '#64748b',
              boxShadow: activeTab === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('otp'); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'otp' ? '#ffffff' : 'transparent',
              color: activeTab === 'otp' ? 'var(--primary-600)' : '#64748b',
              boxShadow: activeTab === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            OTP Login (WhatsApp/SMS)
          </button>
        </div>

        {/* Password Login Form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Email / CPF Number
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ width: 16, height: 16, color: '#94a3b8', position: 'absolute', left: 12, pointerEvents: 'none' }} />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@mseb.com or CPF"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
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
                    outline: 'none',
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
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
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
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              {!loading && <ArrowRight style={{ width: 18, height: 18 }} />}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {activeTab === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone style={{ width: 16, height: 16, color: '#94a3b8', position: 'absolute', left: 12, pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #cbd5e1',
                        fontSize: 'var(--text-sm)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 'var(--text-sm)',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP via WhatsApp/SMS'}
                  {!loading && <MessageSquare style={{ width: 18, height: 18 }} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Enter 6-Digit OTP sent to {mobile}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid #2563eb',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      letterSpacing: '8px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      fontWeight: 800,
                      border: 'none',
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
            textAlign: 'center',
          }}
        >
          <strong>Default Admin Login:</strong>
          <div style={{ fontFamily: 'var(--font-mono)', marginTop: 2, color: 'var(--primary-700)', fontWeight: 700 }}>
            admin@mseb.com / Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}
