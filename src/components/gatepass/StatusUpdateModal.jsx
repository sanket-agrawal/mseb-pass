import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { GATEPASS_STATUS, GATEPASS_STATUS_CONFIG } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const ALLOWED_NEXT_STATUSES = {
  [GATEPASS_STATUS.ISSUED]: [GATEPASS_STATUS.CREDITED, GATEPASS_STATUS.COMPLETED],
  [GATEPASS_STATUS.CREDITED]: [GATEPASS_STATUS.COMPLETED],
  [GATEPASS_STATUS.COMPLETED]: [],
};

export default function StatusUpdateModal({ isOpen, onClose, gatePass, onUpdateStatus, isUpdating }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');

  if (!gatePass) return null;

  const currentStatus = gatePass.status || GATEPASS_STATUS.ISSUED;
  const nextStatuses = ALLOWED_NEXT_STATUSES[currentStatus] || [];

  const handleUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a new status');
      return;
    }
    await onUpdateStatus(gatePass.id, selectedStatus, reason);
    setSelectedStatus('');
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Gate Pass Status"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="accent"
            icon={CheckCircle2}
            disabled={!selectedStatus || isUpdating}
            loading={isUpdating}
            onClick={handleUpdate}
          >
            Update Status
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Current Status:</span>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--gray-800)', marginTop: '2px' }}>
            {GATEPASS_STATUS_CONFIG[currentStatus]?.label || currentStatus} ({GATEPASS_STATUS_CONFIG[currentStatus]?.marathiLabel || ''})
          </div>
        </div>

        {nextStatuses.length === 0 ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '6px', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            This gate pass is in <strong>{currentStatus}</strong> status and cannot be changed further.
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
              Select Next Status:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nextStatuses.map((st) => {
                const conf = GATEPASS_STATUS_CONFIG[st];
                const isSelected = selectedStatus === st;
                return (
                  <div
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-50)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: isSelected ? 'var(--primary-800)' : 'var(--gray-800)' }}>
                        {conf?.label} ({conf?.marathiLabel})
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '2px' }}>
                        {st === 'credited' ? 'Mark transformer as credited / inward received' : 'Mark full operation as completed'}
                      </div>
                    </div>
                    <ArrowRight size={16} color={isSelected ? 'var(--primary-600)' : 'var(--gray-400)'} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {nextStatuses.length > 0 && (
          <Input
            label="Remarks / Note (Optional)"
            placeholder="Reason or notes for this status update..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}
