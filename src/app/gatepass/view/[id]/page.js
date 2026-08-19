'use client';

import React, { use, useState } from 'react';
import GatePassPreview from '@/components/gatepass/GatePassPreview';
import StatusTimeline from '@/components/gatepass/StatusTimeline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useGatePass } from '@/hooks/useGatePass';
import { downloadGatePass } from '@/lib/pdfService';
import { Zap, Download, Printer, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicGatePassViewPage({ params }) {
  const resolvedParams = use(params);
  const { getPass } = useGatePass();
  const [downloading, setDownloading] = useState(false);

  const pass = getPass(resolvedParams.id);

  if (!pass) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
        <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <h2 style={{ color: 'var(--danger-600)', marginBottom: 8 }}>Gate Pass Not Found</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-sm)' }}>
            The requested Gate Pass ID <strong>{resolvedParams.id}</strong> could not be found or has expired.
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

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 12px' }}>
      {/* Mobile Branding Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: '1rem',
          backgroundColor: '#1e3a5f',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <Zap style={{ width: 24, height: 24, color: 'var(--accent-400)', fill: 'currentColor' }} />
        <div>
          <h1 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            MSEB Digital Gate Pass
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--gray-300)', margin: 0 }}>
            MSEB Sub Division Dondaicha (गाळण शाखा-दोंडाईचा)
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
          Download PDF
        </Button>
        <Button variant="secondary" icon={Printer} onClick={handlePrint}>
          Print Pass
        </Button>
      </div>

      {/* Main Yellow Gate Pass Form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GatePassPreview data={pass} />
      </div>

      {/* Status Timeline */}
      <Card header="Transport & Status Timeline" style={{ marginBottom: '1.5rem' }}>
        <StatusTimeline currentStatus={pass.status} />
      </Card>

      {/* Public Footer */}
      <footer style={{ textAlign: 'center', padding: '1rem 0', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
        <p style={{ margin: 0 }}>This digital gate pass was issued by MSEB Sub Division Dondaicha.</p>
        <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>Reference ID: {pass.id}</p>
      </footer>
    </div>
  );
}
