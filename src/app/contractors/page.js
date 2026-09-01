'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { contractorAPI, officeAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Truck, Building, Phone, MapPin, Hash } from 'lucide-react';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [offices, setOffices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    vendor_code: '',
    contact_person: '',
    mobile: '',
    address: '',
    office_id: '',
    mseb_vendor_id: '',
    mseb_loe: '',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [contRes, offRes] = await Promise.all([
        contractorAPI.list(search),
        officeAPI.list()
      ]);
      setContractors(contRes.data || contRes.contractors || []);
      setOffices(offRes.data || offRes.offices || []);
    } catch (err) {
      toast.error('Failed to load contractors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenModal = (contractor = null) => {
    if (contractor) {
      setEditingId(contractor.id);
      setFormData({
        name: contractor.contractor_firm || contractor.first_name || '',
        vendor_code: contractor.vendor_code || '',
        contact_person: contractor.first_name || '',
        mobile: contractor.mobile || '',
        address: contractor.contractor_address || '',
        office_id: contractor.office_id || '',
        mseb_vendor_id: contractor.mseb_vendor_id || '',
        mseb_loe: contractor.mseb_loe || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        vendor_code: '',
        contact_person: '',
        mobile: '',
        address: '',
        office_id: '',
        mseb_vendor_id: '',
        mseb_loe: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Contractor firm name is required');
      return;
    }

    try {
      if (editingId) {
        await contractorAPI.update(editingId, formData);
        toast.success('Contractor updated successfully');
      } else {
        await contractorAPI.create(formData);
        toast.success('Contractor created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save contractor');
    }
  };

  const columns = [
    {
      header: 'Firm Name / Vendor',
      accessorKey: 'contractor_firm',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
            {row.contractor_firm || row.first_name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
            Code: {row.vendor_code || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Vendor ID',
      accessorKey: 'mseb_vendor_id',
      cell: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-700)' }}>
          {row.mseb_vendor_id || '—'}
        </span>
      ),
    },
    {
      header: 'LOE Reference',
      accessorKey: 'mseb_loe',
      cell: (row) => row.mseb_loe || '—',
    },
    {
      header: 'Mapped Office',
      accessorKey: 'office',
      cell: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--gray-700)' }}>
          {row.office?.name ? `${row.office.name} (${row.office.type})` : '—'}
        </span>
      ),
    },
    {
      header: 'Contact & Mobile',
      accessorKey: 'mobile',
      cell: (row) => (
        <div style={{ fontSize: '13px' }}>
          <div>{row.mobile || '—'}</div>
          {row.contractor_address && (
            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{row.contractor_address}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenModal(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--gray-900)' }}>Contractors</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: '4px' }}>
            Manage authorized contractors, vendor codes, and office mappings.
          </p>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => handleOpenModal()}>
          Add Contractor
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: '1rem', maxWidth: '320px' }}>
          <Input
            placeholder="Search contractor or vendor code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table columns={columns} data={contractors} isLoading={isLoading} emptyMessage="No contractors found." />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Contractor' : 'New Contractor'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave}>
              Save Contractor
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Contractor Firm Name"
            required
            placeholder="e.g. Rupesh Transport & Electricals"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Vendor ID"
              placeholder="e.g. VEN-2026-001"
              value={formData.mseb_vendor_id}
              onChange={(e) => setFormData(p => ({ ...p, mseb_vendor_id: e.target.value }))}
            />
            <Input
              label="LOE Reference No."
              placeholder="e.g. LOE-5512"
              value={formData.mseb_loe}
              onChange={(e) => setFormData(p => ({ ...p, mseb_loe: e.target.value }))}
            />
          </div>

          <SearchableSelect
            label="Mapped Office"
            placeholder="Select office..."
            value={formData.office_id}
            onChange={(val) => setFormData(p => ({ ...p, office_id: val }))}
            options={offices.map(o => ({ value: o.id, label: `${o.name} (${o.type})` }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Mobile Number"
              placeholder="10-digit mobile"
              value={formData.mobile}
              onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
            />
            <Input
              label="Vendor Code (Auto-assigned if blank)"
              placeholder="e.g. CON-000001"
              value={formData.vendor_code}
              onChange={(e) => setFormData(p => ({ ...p, vendor_code: e.target.value }))}
            />
          </div>

          <Input
            label="Address"
            placeholder="Firm registered address"
            value={formData.address}
            onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
