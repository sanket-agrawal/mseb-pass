'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

/**
 * A styled confirmation dialog that replaces the native browser confirm().
 *
 * @param {boolean}  isOpen          – Whether the dialog is visible
 * @param {Function} onClose         – Called when the user cancels or clicks X
 * @param {Function} onConfirm       – Called when the user clicks the confirm button
 * @param {string}   [title]         – Dialog title  (default: "Confirm Delete")
 * @param {string|React.ReactNode} [message] – Body text / JSX
 * @param {string}   [confirmLabel]  – Label for the confirm button (default: "Delete")
 * @param {string}   [cancelLabel]   – Label for the cancel button  (default: "Cancel")
 * @param {boolean}  [loading]       – Show a spinner on the confirm button
 * @param {string}   [variant]       – Button variant for confirm button (default: "danger")
 * @param {React.ComponentType} [icon] – Lucide icon for the confirm button
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'danger',
  icon: ConfirmIcon,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            icon={ConfirmIcon}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--danger-50, #fef2f2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle
            style={{ width: 20, height: 20, color: 'var(--danger-500, #ef4444)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px' }}>
          {typeof message === 'string' ? (
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-700)', lineHeight: 1.5 }}>
              {message}
            </p>
          ) : (
            message
          )}
        </div>
      </div>
    </Modal>
  );
}
