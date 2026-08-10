'use client';

import React, { use } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassForm from '@/components/gatepass/GatePassForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useGatePass } from '@/hooks/useGatePass';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditGatePassPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getPass, updateGatePass } = useGatePass();
  
  const pass = getPass(resolvedParams.id);

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

  const handleFormSubmit = (payload) => {
    try {
      updateGatePass(pass.id, payload);
      toast.success(`Gate Pass ${pass.id} updated successfully!`);
      router.push(`/gatepass/${pass.id}`);
    } catch (e) {
      toast.error('Failed to update gate pass');
    }
  };

  return (
    <PageWrapper
      title={`Edit Gate Pass: ${pass.display_id || pass.id}`}
      subtitle={`${(pass.display_id || (pass.serial_number && pass.serial_number !== 'undefined')) ? `Pass Ref: ${pass.display_id || pass.serial_number} • ` : ''}(${pass.type === 'outward' ? 'जावक / OUTWARD' : 'आवक / INWARD'})`}
    >
      <GatePassForm
        initialData={pass}
        isEditMode={true}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
}
