'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

export default function DriverModal({ isOpen, onClose, driver = null, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    license_number: '',
    vehicle_number: '',
    vehicle_type: 'truck'
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        id: driver.id,
        name: driver.name || '',
        mobile: driver.mobile || '',
        license_number: driver.license_number || '',
        vehicle_number: driver.vehicle_number || '',
        vehicle_type: driver.vehicle_type || 'truck'
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        license_number: '',
        vehicle_number: '',
        vehicle_type: 'truck'
      });
    }
  }, [driver, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.vehicle_number) {
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={driver ? 'Edit Driver Details' : 'Register New Driver'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="accent" icon={Save} onClick={handleSubmit}>
            {driver ? 'Update Driver' : 'Save Driver'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Driver Full Name"
          required
          placeholder="e.g. Manoj Pawra"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />

        <Input
          label="Contact Mobile Number"
          required
          placeholder="e.g. 9876543210"
          value={formData.mobile}
          onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
        />

        <Input
          label="License Number"
          placeholder="e.g. MH18-2020-001234"
          value={formData.license_number}
          onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
        />

        <Input
          label="Vehicle Registration Number"
          required
          placeholder="e.g. MH02 680689"
          value={formData.vehicle_number}
          onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
        />

        <Select
          label="Vehicle Type"
          value={formData.vehicle_type}
          onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
          options={[
            { label: 'Truck (मोठी गाडी)', value: 'truck' },
            { label: 'Pickup (पिकअप)', value: 'pickup' },
            { label: 'Tempo (टेंपो)', value: 'tempo' },
          ]}
        />
      </form>
    </Modal>
  );
}
