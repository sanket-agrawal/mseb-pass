'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import DriverModal from '@/components/drivers/DriverModal';
import { driverAPI } from '@/lib/api';
import { Users, Plus, Phone, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await driverAPI.list();
      if (res && res.data) {
        setDrivers(res.data.drivers || res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedDriver(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    setModalOpen(true);
  };

  const handleSaveDriver = async (formData) => {
    try {
      if (formData.id) {
        await driverAPI.update(formData.id, formData);
        toast.success('Driver updated successfully');
      } else {
        await driverAPI.create(formData);
        toast.success('New driver registered successfully');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      toast.error(err.message || 'Failed to save driver');
    }
  };

  const columns = [
    {
      header: 'Driver Name',
      accessorKey: 'name',
      cell: (row) => (
        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
          {row.name}
        </div>
      )
    },
    {
      header: 'Contact Phone',
      accessorKey: 'mobile',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-700)' }}>
          <Phone style={{ width: 14, height: 14, color: 'var(--gray-400)' }} />
          <span>{row.mobile || row.phone}</span>
        </div>
      )
    },
    {
      header: 'Vehicle Number',
      accessorKey: 'vehicle_number',
      cell: (row) => (
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-700)' }}>
          {row.vehicle_number || row.vehicleNo || 'N/A'}
        </div>
      )
    },
    {
      header: 'License Number',
      accessorKey: 'license_number',
      cell: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>
          {row.license_number || row.licenseNo || '-'}
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
      title="Driver Directory"
      subtitle="Registered transport contractor drivers for MSEB gate passes."
      actions={
        <Button variant="accent" icon={Plus} onClick={handleOpenAdd}>
          Add Driver
        </Button>
      }
    >
      <Card>
        <Table
          columns={columns}
          data={drivers}
          loading={loading}
          emptyMessage="No Drivers Registered"
          emptyDescription="Add transport drivers to assign to gate passes."
        />
      </Card>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        driver={selectedDriver}
        onSave={handleSaveDriver}
      />
    </PageWrapper>
  );
}
