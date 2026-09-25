'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { shareAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MessageCircle, Copy, Check, Download, QrCode, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function ShareModal({ isOpen, onClose, gatePass, pass }) {
  const currentPass = gatePass || pass;
  const [mobile, setMobile] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const qrRef = useRef(null);

  if (!currentPass) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gatepass/view/${currentPass.id}`
    : `/gatepass/view/${currentPass.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    toast.success('Verification link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) {
        toast.error('QR Code not ready for download');
        return;
      }
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-${currentPass.display_id || currentPass.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR image');
    }
  };

  const handleWhatsAppShare = async () => {
    const targetMobile = mobile.trim() || currentPass.driver_mobile || currentPass.line_staff_mobile || '';
    const cleanPhone = targetMobile.replace(/\D/g, '');

    const text = encodeURIComponent(
      `⚡ *MSEB Digital Gate Pass Verification*\n` +
      `Pass ID: *${currentPass.display_id || currentPass.id}*\n` +
      `Destination: *${currentPass.destination_substation || currentPass.to_office?.name || '-'}*\n` +
      `Vehicle: *${currentPass.vehicle_number || '-'}*\n\n` +
      `🔗 *Scan / View Live Pass:* ${publicUrl}`
    );

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;

    try {
      setIsSharing(true);
      await shareAPI.share(currentPass.id, 'whatsapp', targetMobile || 'manual');
    } catch (e) {
      // ignore non-critical analytics log
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
      title="QR Verification & Share"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Pass ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentPass.display_id || currentPass.id}</strong>
          </span>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* QR Code Quick Scan Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'var(--gray-50)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1rem',
            textAlign: 'center'
          }}
        >
          <div
            ref={qrRef}
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--gray-200)',
              marginBottom: '10px'
            }}
          >
            <QRCodeCanvas
              value={publicUrl}
              size={168}
              level="H"
              marginSize={1}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-700)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '4px' }}>
            <ShieldCheck style={{ width: 16, height: 16 }} />
            Official Gate Pass Verification QR
          </div>

          <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: '0 0 12px 0', maxWidth: '300px' }}>
            Scan with any smartphone camera or QR scanner at substation / depot gates for instant verification.
          </p>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadQR}
          >
            Download QR Image (PNG)
          </Button>
        </div>

        {/* Public Verification Link Copy */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
            Direct Verification Link
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={publicUrl}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 'var(--text-xs)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--gray-800)',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <Button variant="outline" size="sm" icon={isCopied ? Check : Copy} onClick={handleCopy}>
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* WhatsApp Instant Sharing */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
            Instant WhatsApp Share
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
              placeholder={`WhatsApp number (Default: ${gatePass.driver_mobile || 'Driver/Contractor'})`}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              size="sm"
            />
            <Button
              variant="accent"
              icon={MessageCircle}
              onClick={handleWhatsAppShare}
              loading={isSharing}
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }}
            >
              Send Verification via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
