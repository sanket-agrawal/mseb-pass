'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

export default function SubstationModal({ isOpen, onClose, substation = null, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    division: 'Dhule',
    contact_person: '',
    contact_mobile: '',
    address: ''
  });

  useEffect(() => {
    if (substation) {
      setFormData({
        id: substation.id,
        name: substation.name || '',
        section: substation.section || '',
        division: substation.division || 'Dhule',
        contact_person: substation.contact_person || '',
        contact_mobile: substation.contact_mobile || '',
        address: substation.address || ''
      });
    } else {
      setFormData({
        name: '',
        section: '',
        division: 'Dhule',
        contact_person: '',
        contact_mobile: '',
        address: ''
      });
    }
  }, [substation, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.section) {
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={substation ? 'Edit Substation' : 'Register New Substation'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="accent" icon={Save} onClick={handleSubmit}>
            {substation ? 'Update Substation' : 'Save Substation'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Substation / S/dn Name"
          required
          placeholder="e.g. Shindkheda S/dn"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />

        <Input
          label="Section Name"
          required
          placeholder="e.g. Virdel Section"
          value={formData.section}
          onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
        />

        <Input
          label="Division Name"
          value={formData.division}
          onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
        />

        <Input
          label="Contact Person / Incharge"
          placeholder="e.g. Rohit Salunkhe"
          value={formData.contact_person}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
        />

        <Input
          label="Contact Mobile Number"
          placeholder="e.g. 9427166630"
          value={formData.contact_mobile}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_mobile: e.target.value }))}
        />
      </form>
    </Modal>
  );
}
