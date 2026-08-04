'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassForm from '@/components/gatepass/GatePassForm';
import Loader from '@/components/ui/Loader';
import { useGatePass } from '@/hooks/useGatePass';
import { shareViaWhatsApp } from '@/lib/shareService';
import { addShareLog } from '@/store/gatepassStore';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthUser, canCreateGatePass } from '@/lib/auth';
import { toast } from 'react-hot-toast';

function GatePassNewFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedId = searchParams.get('linked_id');
  const { createPass, getPass } = useGatePass();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkedPass = linkedId ? getPass(linkedId) : null;

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser && !canCreateGatePass(authUser)) {
      toast.error('Access denied. Creating gate pass requires Gate Pass Creator or Super Admin role');
      router.push('/gatepass');
    }
  }, [router]);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      toast.loading('Creating digital gate pass...', { id: 'create-pass-toast' });
      const newPass = await createPass(formData);
      toast.success(`Gate Pass ${newPass.display_id || newPass.id} created successfully!`, { id: 'create-pass-toast' });

      // Trigger auto-share prompt toast for WhatsApp
      toast.custom((t) => (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--success-600)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--gray-900)' }}>
              Pass #{newPass.display_id || newPass.serial_number} Issued!
            </strong>
            <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>
              Send pass details to contractor/driver via WhatsApp?
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                shareViaWhatsApp(newPass, newPass.driver_mobile);
                addShareLog(newPass.id, {
                  method: 'whatsapp',
                  recipient: newPass.driver_mobile || 'Contractor/Driver',
                  shared_by: 'Admin'
                });
                toast.dismiss(t.id);
              }}
              style={{
                backgroundColor: 'var(--success-600)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📱 Send WhatsApp
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                backgroundColor: 'var(--gray-200)',
                color: 'var(--gray-800)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 10000 });

      router.push(`/gatepass/${newPass.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to create gate pass', { id: 'create-pass-toast' });
      setIsSubmitting(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {isSubmitting && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              padding: '2.25rem 2.5rem',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '380px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
              }}
            >
              <Loader2 style={{ width: 34, height: 34, animation: 'spin 1s linear infinite' }} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Creating Gate Pass...
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Generating digital serial number, saving job records, & syncing with MSEDCL database.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <GatePassForm
        onSubmit={handleFormSubmit}
        linkedPass={linkedPass}
        isSubmitting={isSubmitting}
        onCancel={() => router.push('/gatepass')}
      />
    </>
  );
}

export default function NewGatePassPage() {
  return (
    <PageWrapper
      title="Issue Digital Gate Pass"
      subtitle="Fill in transport and transformer details matching the MSEDCL physical yellow pass form."
      actions={
        <Link href="/gatepass" style={{ textDecoration: 'none' }}>
          <Button variant="outline" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<Loader text="Loading form..." />}>
        <GatePassNewFormContent />
      </Suspense>
    </PageWrapper>
  );
}
