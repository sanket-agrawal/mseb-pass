'use client';

import React, { use, useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusTimeline from '@/components/gatepass/StatusTimeline';
import StatusUpdateModal from '@/components/gatepass/StatusUpdateModal';
import GatePassPreview from '@/components/gatepass/GatePassPreview';
import ShareModal from '@/components/gatepass/ShareModal';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import Table from '@/components/ui/Table';
import Loader from '@/components/ui/Loader';
import { gatePassAPI, shareAPI } from '@/lib/api';
import { downloadGatePass } from '@/lib/pdfService';
import { shareViaWhatsApp } from '@/lib/shareService';
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Edit,
  RotateCcw,
  CheckCircle,
  Eye,
  FileText,
  Clock,
  Send,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function GatePassDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [pass, setPass] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'preview' | 'audit'
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchPassData();
  }, [resolvedParams.id]);

  const fetchPassData = async () => {
    setLoading(true);
    try {
      const res = await gatePassAPI.get(resolvedParams.id);
      if (res && res.data) {
        setPass(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load gate pass');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await gatePassAPI.getAudit(resolvedParams.id);
      if (res && res.data) {
        setAuditLogs(res.data);
      }
    } catch (e) {
      console.warn('Audit fetch failed:', e);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Gate Pass Detail">
        <Loader text="Fetching digital gate pass record..." />
      </PageWrapper>
    );
  }

  if (!pass) {
    return (
      <PageWrapper title="Gate Pass Not Found">
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Pass ID {resolvedParams.id} was not found.</h3>
          <Link href="/gatepass" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Button variant="primary" icon={ArrowLeft}>Back to Directory</Button>
          </Link>
        </Card>
      </PageWrapper>
    );
  }

  const isOutward = pass.type === 'outward';
  const canCreateReturn = isOutward && (pass.status === 'delivered' || pass.status === 'completed') && !pass.return_gatepass_id;

  const handleStatusConfirm = async (newStatus, remarks) => {
    try {
      toast.loading(`Updating status to ${newStatus}...`, { id: 'status-toast' });
      await gatePassAPI.updateStatus(pass.id, newStatus, remarks);
      toast.success(`Status updated to ${newStatus}!`, { id: 'status-toast' });
      setStatusModalOpen(false);
      fetchPassData();
    } catch (err) {
      toast.error(err.message || 'Status update failed', { id: 'status-toast' });
    }
  };

  const handleCreateReturn = () => {
    router.push(`/gatepass/new?linked_id=${pass.id}`);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    toast.loading('Generating digital PDF document...', { id: 'pdf-toast' });
    try {
      await downloadGatePass(pass);
      toast.success('PDF downloaded successfully!', { id: 'pdf-toast' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF document', { id: 'pdf-toast' });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    setViewMode('preview');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleQuickWhatsAppDriver = async () => {
    try {
      await shareAPI.share(pass.id, 'whatsapp', pass.driver_mobile || 'Driver');
    } catch (e) {
      console.warn('Share API log error:', e);
    }
    shareViaWhatsApp(pass, pass.driver_mobile);
    toast.success('Opened WhatsApp with pass details!', { icon: '📱' });
  };

  const materialColumns = [
    { header: 'अ.नं.', accessorKey: 'sr_no', width: '50px' },
    { header: 'मालाचे / रोहित्र वर्णन', accessorKey: 'item_type', cell: (r) => <strong>{r.item_type || 'Transformer'}</strong> },
    { header: 'मेक (Make)', accessorKey: 'make' },
    { header: 'सि.नं. (Sr No)', accessorKey: 'serial_number', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.serial_number}</span> },
    { header: 'क्षमता (KVA)', accessorKey: 'capacity', cell: (r) => <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{r.capacity}</span> },
    { header: 'गावाचे नांव', accessorKey: 'village_name' },
    { header: 'DTC नं.', accessorKey: 'dtc_number', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.dtc_number || '-'}</span> },
    {
      header: 'स्थिती (Condition)',
      accessorKey: 'condition',
      cell: (r) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: r.condition === 'faulty' ? 'var(--danger-50)' : r.condition === 'repaired' ? 'var(--warning-50)' : 'var(--success-50)',
            color: r.condition === 'faulty' ? 'var(--danger-600)' : r.condition === 'repaired' ? 'var(--warning-600)' : 'var(--success-600)'
          }}
        >
          {r.condition === 'faulty' ? 'दूषित/जळालेले (Faulty)' : r.condition === 'repaired' ? 'दुरुस्त (Repaired)' : 'नवीन (New)'}
        </span>
      )
    }
  ];

  return (
    <PageWrapper
      title={`Gate Pass: ${pass.display_id || pass.id}`}
      subtitle={`Serial No. ${pass.serial_number} • Date: ${pass.date ? new Date(pass.date).toISOString().split('T')[0] : ''}`}
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/gatepass" style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon={ArrowLeft}>Back</Button>
          </Link>

          <Button variant="accent" icon={() => <WhatsAppIcon size={18} color="#0f172a" />} onClick={handleQuickWhatsAppDriver}>
            Send to Driver
          </Button>

          <Button variant="secondary" icon={Share2} onClick={() => setShareModalOpen(true)}>
            Share
          </Button>

          <Button variant="outline" icon={CheckCircle} onClick={() => setStatusModalOpen(true)}>
            Status
          </Button>

          {canCreateReturn && (
            <Button variant="accent" icon={RotateCcw} onClick={handleCreateReturn}>
              Create Return Pass
            </Button>
          )}

          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print
          </Button>

          <Button variant="primary" icon={Download} loading={downloadingPdf} onClick={handleDownloadPdf}>
            PDF
          </Button>
        </div>
      }
    >
      {/* Linked Pass Banners */}
      {pass.linked_gatepass_id && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-50)',
            border: '1px solid var(--accent-200)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw style={{ width: 20, height: 20, color: 'var(--accent-600)' }} />
            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-700)' }}>
                LINKED RETURN GATE PASS
              </span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>
                This return pass is linked to Outward Gate Pass: <strong>{pass.linked_gatepass_id}</strong>
              </p>
            </div>
          </div>
          <Link href={`/gatepass/${pass.linked_gatepass_id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">View Outward Pass</Button>
          </Link>
        </div>
      )}

      {/* View Mode Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--gray-200)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'cards' ? 'var(--primary-600)' : 'transparent',
              color: viewMode === 'cards' ? '#ffffff' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Eye style={{ width: 16, height: 16 }} />
            Detail Cards View
          </button>

          <button
            onClick={() => setViewMode('preview')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'preview' ? 'var(--accent-500)' : 'transparent',
              color: viewMode === 'preview' ? 'var(--gray-900)' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <FileText style={{ width: 16, height: 16 }} />
            Yellow Pass Form Preview
          </button>

          <button
            onClick={() => { setViewMode('audit'); fetchAuditTrail(); }}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'audit' ? '#1e293b' : 'transparent',
              color: viewMode === 'audit' ? '#ffffff' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <History style={{ width: 16, height: 16 }} />
            Audit Trail
          </button>
        </div>
      </div>

      {viewMode === 'cards' && (
        <>
          {/* Lifecycle Status Timeline */}
          <Card header="Lifecycle Status Timeline" style={{ marginBottom: '1.5rem' }}>
            <StatusTimeline currentStatus={pass.status} />
          </Card>

          {/* Detail Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Card header="Recipient & Substation Details (प्रती)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>RECIPIENT (प्रती)</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {pass.recipient_name} ({pass.recipient_designation || 'Staff'})
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>DESTINATION SUBSTATION</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {pass.destination_substation}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                    Section: {pass.destination_section} • Division: {pass.destination_division}
                  </div>
                </div>
              </div>
            </Card>

            <Card header="Transport & Driver Information (गाडी नं.)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>DRIVER NAME</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {pass.driver_name || 'TBD'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>Phone: {pass.driver_mobile || 'N/A'}</div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>VEHICLE REGISTRATION</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-800)' }}>
                    {pass.vehicle_number || 'TBD'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>CONTRACTOR (ठेकेदारास)</span>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)' }}>
                    {pass.contractor_name || 'MSEDCL'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card header="Material / Transformer Items (मालाचे वर्णन)" style={{ marginBottom: '1.5rem' }}>
            <Table
              columns={materialColumns}
              data={pass.materials || []}
              emptyMessage="No material details recorded"
            />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Card header="Destination Line Staff & Verification">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-sm)' }}>
                <div><strong>Staff Name:</strong> {pass.line_staff_name || '-'}</div>
                <div><strong>Mobile Phone:</strong> {pass.line_staff_mobile || '-'}</div>
                <div><strong>CPF Number:</strong> {pass.line_staff_cpf || '-'}</div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8, marginTop: 4 }}>
                  <strong>Issued By (Sender):</strong> {pass.sender_name} ({pass.sender_designation})
                </div>
              </div>
            </Card>

            <Card header="Check & Condition Certificate (शेरा)">
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-800)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {pass.remarks}
              </div>
            </Card>
          </div>
        </>
      )}

      {viewMode === 'preview' && (
        <div style={{ marginBottom: '2rem' }}>
          <GatePassPreview data={pass} />
        </div>
      )}

      {viewMode === 'audit' && (
        <Card header="Audit Trail & Modification Timeline">
          {auditLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0.5rem 0' }}>
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--gray-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-700)' }}>
                    <span>{log.action?.toUpperCase()} — {log.user_name} (CPF: {log.user_cpf})</span>
                    <span style={{ color: 'var(--gray-500)' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-800)', margin: 0 }}>
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', padding: '1rem 0', textAlign: 'center' }}>
              No audit log entries recorded for this pass yet.
            </p>
          )}
        </Card>
      )}

      {/* Modals */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={pass.status}
        onConfirm={handleStatusConfirm}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pass={pass}
      />
    </PageWrapper>
  );
}
