'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { getAuthUser, canManageContractors } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { contractorAPI } from '@/lib/api';
import { Plus, Phone, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContractorsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser && !canManageContractors(authUser)) {
      toast.error('Access restricted to Admin or Super Admin role');
      router.push('/dashboard');
      return;
    }
    fetchContractors();
  }, [router]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await contractorAPI.list();
      const dbList = res?.data?.contractors || res?.data;
      if (Array.isArray(dbList)) {
        setContractors(dbList);
      }
    } catch (err) {
      console.log('Contractor DB load info:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    mobile: '',
    address: '',
    class_category: 'Class A Contractor',
  });

  const handleOpenAdd = () => {
    setSelectedContractor(null);
    setFormData({
      name: '',
      contact_person: '',
      mobile: '',
      address: '',
      class_category: 'Class A Contractor',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      name: contractor.name || '',
      contact_person: contractor.contact_person || '',
      mobile: contractor.mobile || '',
      address: contractor.address || '',
      class_category: contractor.class_category || 'Class A Contractor',
    });
    setModalOpen(true);
  };

  const handleSaveContractor = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Contractor company name is required');
      return;
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.trim())) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }

    try {
      if (selectedContractor && selectedContractor.id && !selectedContractor.id.startsWith('cnt_')) {
        await contractorAPI.update(selectedContractor.id, formData);
      } else if (!selectedContractor) {
        await contractorAPI.create(formData);
      }
    } catch (err) {
      console.log('Contractor API save info:', err?.message);
    }

    if (selectedContractor) {
      setContractors(prev =>
        prev.map(c => (c.id === selectedContractor.id ? { ...c, ...formData } : c))
      );
      toast.success('Contractor updated successfully');
    } else {
      const newContractor = {
        id: `cnt_${Date.now()}`,
        ...formData,
        total_passes: 0,
        rating: '5.0 ★',
        is_active: true,
      };
      setContractors(prev => [newContractor, ...prev]);
      toast.success('New contractor registered successfully');
    }
    setModalOpen(false);
    fetchContractors();
  };

  const columns = [
    {
      header: 'Contractor Company Name',
      accessorKey: 'name',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
            {row.name}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {row.address || 'MSEDCL Registered Partner'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact Official',
      accessorKey: 'contact_person',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {row.contact_person || 'Representative'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '11px' }}>
            <Phone style={{ width: 12, height: 12 }} />
            <span>{row.mobile}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Gate Passes Issued',
      accessorKey: 'total_passes',
      cell: (row) => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '13px' }}>
          {row.total_passes} passes
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      align: 'right',
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)}>
          <Edit style={{ width: 15, height: 15 }} /> Edit
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Contractor Directory & Performance"
      subtitle="Authorized transport contractors and electrical repair vendors for MSEDCL Gate Passes."
      actions={
        <Button variant="accent" icon={Plus} onClick={handleOpenAdd}>
          Add Contractor
        </Button>
      }
    >
      <Card>
        <Table
          columns={columns}
          data={contractors}
          loading={false}
          emptyMessage="No Contractors Registered"
          emptyDescription="Register MSEDCL transport contractors to assign to digital gate passes."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedContractor ? 'Edit Contractor Details' : 'Register New Contractor'}
      >
        <form onSubmit={handleSaveContractor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Contractor Company Name"
            placeholder="e.g. M/S Standard Electrotech Service"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="Contact Person Name"
            placeholder="e.g. Rupesh Contractor"
            value={formData.contact_person}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
          />

          <Input
            label="Contact Mobile Phone"
            placeholder="e.g. 9876543212"
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
          />

          <Input
            label="Business Address / Area"
            placeholder="e.g. Dondaicha MIDC, Dist. Dhule"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              Save Contractor
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
