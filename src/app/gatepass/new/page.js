'use client';

import React, { Suspense } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassForm from '@/components/gatepass/GatePassForm';
import Loader from '@/components/ui/Loader';
import { useGatePass } from '@/hooks/useGatePass';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function NewGatePassContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createGatePass, getPass } = useGatePass();

  const linkedId = searchParams.get('linked_id');
  const linkedPass = linkedId ? getPass(linkedId) : null;

  let prefillData = null;
  if (linkedPass) {
    prefillData = {
      type: 'inward',
      status: 'return_issued',
      recipient_name: 'Executive Engineer',
      recipient_designation: 'EE',
      destination_section: 'Dondaicha Section',
      destination_substation: 'Dondaicha 132kV Substation',
      destination_division: 'Dhule',
      driver_id: linkedPass.driver_id,
      driver_name: linkedPass.driver_name,
      driver_mobile: linkedPass.driver_mobile,
      vehicle_number: linkedPass.vehicle_number,
      contractor_name: linkedPass.contractor_name,
      materials: (linkedPass.materials || []).map((m, idx) => ({
        ...m,
        sr_no: idx + 1,
        condition: 'faulty',
        remarks: 'Faulty transformer returned from site'
      })),
      line_staff_name: linkedPass.line_staff_name,
      line_staff_mobile: linkedPass.line_staff_mobile,
      line_staff_cpf: linkedPass.line_staff_cpf,
      sender_name: linkedPass.line_staff_name || 'Line Staff',
      sender_designation: 'Line Staff',
      remarks: 'दूषित / जळालेले रोहित्र परतीसाठी पाठवले. ऑइल गळती नाही.',
      linked_gatepass_id: linkedPass.id
    };
  }

  const handleFormSubmit = (payload) => {
    try {
      const created = createGatePass(payload);
      toast.success(`Gate Pass ${created.id} issued successfully!`);
      router.push(`/gatepass/${created.id}`);
    } catch (e) {
      toast.error('Failed to create gate pass');
    }
  };

  return (
    <PageWrapper
      title={linkedPass ? `Create Return Pass for ${linkedPass.id}` : 'Create New Gate Pass'}
      subtitle="Fill in transformer details, driver assignment, and substation routing."
    >
      <GatePassForm
        initialData={prefillData}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
}

export default function NewGatePassPage() {
  return (
    <Suspense fallback={<Loader text="Loading gate pass form..." />}>
      <NewGatePassContent />
    </Suspense>
  );
}
