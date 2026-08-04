'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { shareViaWhatsApp, copyPassLinkToClipboard, getPublicGatePassUrl, formatWhatsAppMessage } from '@/lib/shareService';
import { shareAPI } from '@/lib/api';
import { Mail, Copy, Send, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShareModal({ isOpen, onClose, pass }) {
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'email' | 'link'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (pass) {
      setPhoneNumber(pass.driver_mobile || '');
      setRecipientName(pass.recipient_name || '');
    }
  }, [pass]);

  if (!pass) return null;

  const publicUrl = getPublicGatePassUrl(pass);
  const waPreviewText = formatWhatsAppMessage(pass, publicUrl);

  const handleWhatsAppSend = async () => {
    try {
      await shareAPI.share(pass.id, 'whatsapp', phoneNumber || pass.driver_mobile || 'Driver');
    } catch (e) {
      console.warn('Share API log error:', e);
    }
    shareViaWhatsApp(pass, phoneNumber);
    toast.success('Queued WhatsApp notification & opened app!', { icon: '📱' });
    onClose();
  };

  const handleCopyLink = async () => {
    await copyPassLinkToClipboard(pass);
    setCopied(true);
    toast.success('Public view link copied to clipboard!', { icon: '🔗' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter a recipient email address');
      return;
    }

    setSendingEmail(true);
    toast.loading('Queueing email notification...', { id: 'email-toast' });
    try {
      await shareAPI.share(pass.id, 'email', email);
      toast.success(`Email queued to ${email}!`, { id: 'email-toast', icon: '📧' });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to queue email notification.', { id: 'email-toast' });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share Gate Pass: ${pass.display_id || pass.id}`} size="md">
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          margin: '-1.5rem -1.5rem 1.25rem -1.5rem',
          backgroundColor: 'var(--gray-50)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          style={{
            flex: 1,
            padding: '12px 10px',
            border: 'none',
            borderBottom: activeTab === 'whatsapp' ? '2px solid var(--success-600)' : '2px solid transparent',
            backgroundColor: activeTab === 'whatsapp' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'whatsapp' ? 'var(--success-700)' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <WhatsAppIcon size={16} color={activeTab === 'whatsapp' ? 'var(--success-600)' : 'var(--gray-600)'} />
          WhatsApp
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          style={{
            flex: 1,
            padding: '12px 10px',
            border: 'none',
            borderBottom: activeTab === 'email' ? '2px solid var(--primary-600)' : '2px solid transparent',
            backgroundColor: activeTab === 'email' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'email' ? 'var(--primary-700)' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Mail style={{ width: 16, height: 16 }} />
          Email
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('link')}
          style={{
            flex: 1,
            padding: '12px 10px',
            border: 'none',
            borderBottom: activeTab === 'link' ? '2px solid var(--accent-600)' : '2px solid transparent',
            backgroundColor: activeTab === 'link' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'link' ? 'var(--accent-700)' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Copy style={{ width: 16, height: 16 }} />
          Copy Link
        </button>
      </div>

      {/* WhatsApp Tab Content */}
      {activeTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Driver / Recipient Mobile Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="9876543210"
            helperText="Enter 10-digit mobile number for WhatsApp notification"
          />

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
              Message Preview:
            </label>
            <pre
              style={{
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                maxHeight: 180,
                overflowY: 'auto',
                color: 'var(--gray-800)',
                fontFamily: 'var(--font-mono)',
                margin: 0
              }}
            >
              {waPreviewText}
            </pre>
          </div>

          <Button variant="accent" icon={WhatsAppIcon} fullWidth onClick={handleWhatsAppSend}>
            Send via WhatsApp
          </Button>
        </div>
      )}

      {/* Email Tab Content */}
      {activeTab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Recipient Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ae.substation@mseb.com"
          />

          <Input
            label="Recipient Name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Name or Designation"
          />

          <Button variant="primary" icon={Send} loading={sendingEmail} fullWidth onClick={handleSendEmail}>
            Send Email Notification
          </Button>
        </div>
      )}

      {/* Copy Link Tab Content */}
      {activeTab === 'link' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
              Public Mobile View URL:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={publicUrl}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--gray-50)',
                  color: 'var(--gray-800)',
                  height: '38px'
                }}
              />
              <Button variant={copied ? 'secondary' : 'primary'} icon={copied ? Check : Copy} onClick={handleCopyLink} style={{ height: '38px' }}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', margin: 0 }}>
            Anyone with this link can view the digital gate pass and download the PDF on their phone without logging in.
          </p>
        </div>
      )}
    </Modal>
  );
}
