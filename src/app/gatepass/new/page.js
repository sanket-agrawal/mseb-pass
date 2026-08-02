'use client';

import React, { Suspense } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassForm from '@/components/gatepass/GatePassForm';
import Loader from '@/components/ui/Loader';
import { useGatePass } from '@/hooks/useGatePass';
import { shareViaWhatsApp } from '@/lib/shareService';
import { addShareLog } from '@/store/gatepassStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function GatePassNewFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedId = searchParams.get('linked_id');
  const { createPass, getPass } = useGatePass();

  const linkedPass = linkedId ? getPass(linkedId) : null;

  const handleFormSubmit = async (formData) => {
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
              Send pass details to driver {newPass.driver_name || 'Driver'} via WhatsApp?
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                shareViaWhatsApp(newPass, newPass.driver_mobile);
                addShareLog(newPass.id, {
                  method: 'whatsapp',
                  recipient: newPass.driver_mobile || 'Driver',
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
    }
  };

  return (
    <GatePassForm
      onSubmit={handleFormSubmit}
      linkedPass={linkedPass}
      onCancel={() => router.push('/gatepass')}
    />
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
