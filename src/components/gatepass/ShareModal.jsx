import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { shareAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, gatePass }) {
  const [mobile, setMobile] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!gatePass) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gatepass/view/${gatePass.id}`
    : `/gatepass/view/${gatePass.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleWhatsAppShare = async () => {
    const targetMobile = mobile.trim() || gatePass.driver_mobile || gatePass.line_staff_mobile || '';
    const cleanPhone = targetMobile.replace(/\D/g, '');

    const text = encodeURIComponent(`Digital Gate Pass #${gatePass.display_id || gatePass.id} has been issued.\nView details: ${publicUrl}`);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;

    try {
      setIsSharing(true);
      await shareAPI.share(gatePass.id, 'whatsapp', targetMobile || 'manual');
    } catch (e) {
      // ignore
    } finally {
      setIsSharing(false);
    }

    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Gate Pass"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
            Gate Pass Public Link
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={publicUrl}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 'var(--text-sm)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--gray-50)'
              }}
            />
            <Button variant="outline" icon={isCopied ? Check : Copy} onClick={handleCopy}>
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
            Share via WhatsApp
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
              placeholder="Enter 10-digit WhatsApp number (optional)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <Button
              variant="accent"
              icon={MessageCircle}
              onClick={handleWhatsAppShare}
              loading={isSharing}
              style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
            >
              Open in WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
