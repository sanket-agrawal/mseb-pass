'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getAuthUser, updateUserPassword, mustChangePassword } from '@/lib/auth';
import { KeyRound, ShieldAlert, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MandatoryPasswordModal() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    if (authUser && mustChangePassword(authUser)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, []);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current / test password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password cannot be the same as your temporary test password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation password do not match');
      return;
    }

    setSubmitting(true);
    try {
      toast.loading('Updating password...', { id: 'change-pwd-toast' });
      await updateUserPassword(currentPassword, newPassword);
      toast.success('Password updated successfully! Welcome to Digital Gate Pass System.', { id: 'change-pwd-toast' });
      setShowModal(false);
      // Reload page to reflect updated session
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error(err?.message || 'Failed to update password. Please verify current password.', { id: 'change-pwd-toast' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '2px solid var(--accent-500)',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '2px solid var(--accent-500)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-500)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <KeyRound style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              Mandatory Password Change
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--accent-400)', fontWeight: 600 }}>
              First-Time Login Security Setup
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fcd34d',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            ⚠️ <strong>Security Action Required:</strong> You logged in with a temporary / test password. You must change your password before accessing the system.
          </div>

          {/* Current / Test Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Current / Temporary Password"
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder="Enter current test password..."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              {showCurrent ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
            </button>
          </div>

          {/* New Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="New Password"
              type={showNew ? 'text' : 'password'}
              required
              placeholder="Minimum 6 characters..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              {showNew ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder="Re-enter new password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              {showConfirm ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            icon={CheckCircle2}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '0.5rem', fontWeight: 700 }}
          >
            {submitting ? 'Updating Password...' : 'Save New Password & Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
