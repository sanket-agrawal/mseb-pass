'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SubstationModal from '@/components/substations/SubstationModal';
import { useDrivers } from '@/hooks/useDrivers';
import { Building2, Plus, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SubstationsPage() {
  const { substations, loading, saveSubstation } = useDrivers();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSubstation, setSelectedSubstation] = useState(null);

  const handleOpenAdd = () => {
    setSelectedSubstation(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubstation(sub);
    setModalOpen(true);
  };

  const handleSaveSubstation = (formData) => {
    saveSubstation(formData);
    toast.success(formData.id ? 'Substation updated successfully' : 'New substation registered successfully');
  };

  const columns = [
    {
      header: 'Substation Name',
      accessorKey: 'name',
      cell: (row) => (
        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
          {row.name}
        </div>
      )
    },
    {
      header: 'Section',
      accessorKey: 'section',
      cell: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
          {row.section || '-'}
        </span>
      )
    },
    {
      header: 'Division',
      accessorKey: 'division',
      cell: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
          {row.division || 'Dhule'}
        </span>
      )
    },
    {
      header: 'Incharge Contact',
      accessorKey: 'contact_person',
      cell: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <div style={{ fontWeight: 600 }}>{row.contact_person || '-'}</div>
          <div style={{ color: 'var(--gray-500)' }}>{row.contact_mobile || ''}</div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      align: 'right',
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
          <Edit style={{ width: 16, height: 16 }} /> Edit
        </Button>
      )
    }
  ];

  return (
    <PageWrapper
      title="Substations Directory"
      subtitle="MSEB sub-stations and extra high voltage (EHV) depots."
      actions={
        <Button variant="accent" icon={Plus} onClick={handleOpenAdd}>
          Add Substation
        </Button>
      }
    >
      <Card>
        <Table
          columns={columns}
          data={substations}
          loading={loading}
          emptyMessage="No Substations Registered"
          emptyDescription="Add MSEB substations to route gate passes."
        />
      </Card>

      <SubstationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        substation={selectedSubstation}
        onSave={handleSaveSubstation}
      />
    </PageWrapper>
  );
}
