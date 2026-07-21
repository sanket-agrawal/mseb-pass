'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { GATEPASS_STATUS_CONFIG } from '@/lib/constants';
import { CheckCircle } from 'lucide-react';

export default function StatusUpdateModal({ isOpen, onClose, currentStatus, onConfirm }) {
  const [newStatus, setNewStatus] = useState(currentStatus || 'issued');
  const [remarks, setRemarks] = useState('');

  const statusOptions = Object.keys(GATEPASS_STATUS_CONFIG).map(key => ({
    label: `${GATEPASS_STATUS_CONFIG[key].label} (${GATEPASS_STATUS_CONFIG[key].marathiLabel})`,
    value: key
  }));

  const handleConfirm = () => {
    onConfirm(newStatus, remarks);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Gate Pass Status"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="accent" icon={CheckCircle} onClick={handleConfirm}>
            Update Status
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Select
          label="Select New Lifecycle Status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          options={statusOptions}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
            Status Update Remarks / Log
          </label>
          <textarea
            rows={3}
            placeholder="Add optional notes (e.g. Received at substation yard by Line Staff)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
