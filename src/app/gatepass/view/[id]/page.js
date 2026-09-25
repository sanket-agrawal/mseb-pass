'use client';

import React, { use, useState, useEffect } from 'react';
import GatePassPreview from '@/components/gatepass/GatePassPreview';
import StatusTimeline from '@/components/gatepass/StatusTimeline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { gatePassAPI } from '@/lib/api';
import { downloadGatePass } from '@/lib/pdfService';
import { Download, Printer, ShieldCheck, CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LOGO_BASE64 from '@/lib/logoBase64';

export default function PublicGatePassViewPage({ params }) {
  const resolvedParams = use(params);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadPass() {
      setLoading(true);
      try {
        const res = await gatePassAPI.getPublic(resolvedParams.id).catch(() => gatePassAPI.get(resolvedParams.id));
        if (res && res.data) {
          setPass(res.data);
        }
      } catch (e) {
        console.error('Failed to load public pass:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '3rem auto', padding: '1rem', textAlign: 'center' }}>
        <Card style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: '200px', height: '24px' }} />
          <div className="skeleton" style={{ width: '300px', height: '16px' }} />
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Verifying Digital Gate Pass with MSEB System...
          </p>
        </Card>
      </div>
    );
  }

  if (!pass) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
        <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <h2 style={{ color: 'var(--danger-600)', marginBottom: 8 }}>Gate Pass Not Found</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
            The requested Gate Pass ID <strong>{resolvedParams.id}</strong> could not be verified or has expired.
          </p>
        </Card>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    toast.loading('Generating digital PDF...', { id: 'pub-pdf' });
    try {
      await downloadGatePass(pass);
      toast.success('PDF downloaded!', { id: 'pub-pdf' });
    } catch (e) {
      toast.error('Failed to generate PDF', { id: 'pub-pdf' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isOutward = pass.type === 'outward';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1rem 12px 3rem 12px' }}>
      {/* Official Security Verification Banner */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#14532d' }}>
                VERIFIED AUTHENTIC DIGITAL GATE PASS
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  textTransform: 'uppercase'
                }}
              >
                MSEB Maharashtra
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#166534', margin: '2px 0 0 0' }}>
              Reference ID: <strong>{pass.display_id || pass.id}</strong> • Official Record
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isOutward ? 'var(--accent-100)' : 'var(--pink-100)',
              color: isOutward ? 'var(--accent-800)' : 'var(--pink-800)',
              border: isOutward ? '1px solid var(--accent-300)' : '1px solid var(--pink-300)',
              textTransform: 'uppercase'
            }}
          >
            {isOutward ? 'Outward (जावक)' : 'Inward (आवक)'}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: pass.status === 'credited' ? '#fef3c7' : '#dbeafe',
              color: pass.status === 'credited' ? '#92400e' : '#1e40af',
              border: pass.status === 'credited' ? '1px solid #fde68a' : '1px solid #bfdbfe',
              textTransform: 'uppercase'
            }}
          >
            Status: {pass.status || 'Issued'}
          </span>
        </div>
      </div>

      {/* Mobile Branding Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: '1rem',
          backgroundColor: '#1e3a5f',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: '3px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={LOGO_BASE64}
            alt="MSEB Logo"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Digital Gate Pass Portal
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--gray-300)', margin: 0 }}>
            Sub Division Dondaicha (गाळण शाखा-दोंडाईचा) • MSEB
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <Button variant="accent" icon={Download} loading={downloading} onClick={handleDownload}>
          Download Official PDF
        </Button>
        <Button variant="secondary" icon={Printer} onClick={handlePrint}>
          Print Pass
        </Button>
      </div>

      {/* Main Yellow Gate Pass Form Preview */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GatePassPreview data={pass} />
      </div>

      {/* Status Timeline */}
      <Card header="Transport & Delivery Timeline" style={{ marginBottom: '1.5rem' }}>
        <StatusTimeline currentStatus={pass.status} />
      </Card>

      {/* Public Footer */}
      <footer style={{ textAlign: 'center', padding: '1rem 0', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
        <p style={{ margin: 0 }}>This digital gate pass was issued by Sub Division Dondaicha, MSEB.</p>
        <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>Verified Record: {pass.id}</p>
      </footer>
    </div>
  );
}
