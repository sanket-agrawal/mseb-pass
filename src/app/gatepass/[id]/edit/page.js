'use client';

import React, { use, useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassForm from '@/components/gatepass/GatePassForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useGatePass } from '@/hooks/useGatePass';
import { gatePassAPI } from '@/lib/api';
import { getAuthUser, canEditGatePass } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditGatePassPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { updateGatePass } = useGatePass();

  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser && !canEditGatePass(authUser)) {
      toast.error('Access denied. Editing gate pass requires Admin or Super Admin role');
      router.push('/gatepass');
      return;
    }
    fetchPass();
  }, [resolvedParams.id, router]);

  async function fetchPass() {
    setLoading(true);
    try {
      const res = await gatePassAPI.get(resolvedParams.id);
      if (res && res.data) {
        setPass(res.data);
      }
    } catch (err) {
      console.error('Error fetching pass for edit:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      toast.loading(`Updating Gate Pass ${pass.display_id || pass.id}...`, { id: 'edit-pass-toast' });
      await updateGatePass(pass.id, payload);
      toast.success(`Gate Pass ${pass.display_id || pass.id} updated successfully!`, { id: 'edit-pass-toast' });
      router.push(`/gatepass/${pass.id}`);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to update gate pass', { id: 'edit-pass-toast' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Edit Gate Pass">
        <Loader text="Loading gate pass details for editing..." />
      </PageWrapper>
    );
  }

  if (!pass) {
    return (
      <PageWrapper title="Gate Pass Not Found">
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Pass ID {resolvedParams.id} was not found.</h3>
          <Link href="/gatepass" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Button variant="primary" icon={ArrowLeft}>Back to Gate Passes</Button>
          </Link>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Edit Gate Pass: ${pass.display_id || pass.id}`}
      subtitle={`${(pass.display_id || (pass.serial_number && pass.serial_number !== 'undefined')) ? `Pass Ref: ${pass.display_id || pass.serial_number} • ` : ''}(${pass.type === 'outward' ? 'जावक / OUTWARD' : 'आवक / INWARD'})`}
      actions={
        <Link href={`/gatepass/${pass.id}`} style={{ textDecoration: 'none' }}>
          <Button variant="outline" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      }
    >
      <GatePassForm
        initialData={pass}
        isEditMode={true}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onCancel={() => router.push(`/gatepass/${pass.id}`)}
      />
    </PageWrapper>
  );
}
