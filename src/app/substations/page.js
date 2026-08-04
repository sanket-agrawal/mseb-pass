'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SubstationModal from '@/components/substations/SubstationModal';
import { getAuthUser, canManageStations } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SubstationsPage() {
  const router = useRouter();
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSubstation, setSelectedSubstation] = useState(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser && !canManageStations(authUser)) {
      toast.error('Access restricted to Admin or Super Admin role');
      router.push('/dashboard');
      return;
    }
    fetchOffices();
  }, [router]);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const res = await officeAPI.list();
      if (res && res.data) {
        setSubstations(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load offices');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedSubstation(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubstation(sub);
    setModalOpen(true);
  };

  const handleSaveSubstation = async (formData) => {
    try {
      if (formData.id) {
        await officeAPI.update(formData.id, formData);
        toast.success('Substation updated successfully');
      } else {
        await officeAPI.create(formData);
        toast.success('New substation registered successfully');
      }
      setModalOpen(false);
      fetchOffices();
    } catch (err) {
      toast.error(err.message || 'Failed to save substation');
    }
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
      header: 'Type / Code',
      accessorKey: 'type',
      cell: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
          {row.type || 'sub_office'} {row.code ? `(${row.code})` : ''}
        </span>
      )
    },
    {
      header: 'Division / Circle',
      accessorKey: 'division',
      cell: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
          {row.division || row.circle || 'Division'}
        </span>
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
      title="Substations & Offices Directory"
      subtitle="MSEB sub-stations, divisions, and EHV depots."
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
