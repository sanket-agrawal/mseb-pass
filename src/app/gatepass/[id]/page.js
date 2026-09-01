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

import { getAuthUser, canViewAuditTrail, canEditGatePass } from '@/lib/auth';

export default function GatePassDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState(() => getAuthUser());
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
  const returnPassObj = pass.return_gatepass || pass.linked_gatepass;
  const linkedOutwardObj = pass.linked_gatepass;
  const canCreateReturn = isOutward && !pass.return_gatepass_id && !pass.return_gatepass?.id && pass.status !== 'cancelled';

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
    { header: 'Job नं.', accessorKey: 'job_number', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.job_number || '-'}</span> },
    { header: 'गावाचे नांव', accessorKey: 'village_name' },
    { header: 'ग्रुप नं. (Group)', accessorKey: 'group_number', cell: (r) => <span>{r.group_number || '-'}</span> },
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
      subtitle={`${(pass.display_id || (pass.serial_number && pass.serial_number !== 'undefined')) ? `Pass Ref: ${pass.display_id || pass.serial_number} • ` : ''}Date: ${pass.date ? new Date(pass.date).toISOString().split('T')[0] : ''}`}
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/gatepass" style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon={ArrowLeft}>Back</Button>
          </Link>

          {/* <Button variant="accent" icon={() => <WhatsAppIcon size={18} color="#0f172a" />} onClick={handleQuickWhatsAppDriver}>
            Send to Driver
          </Button> */}

          {/* <Button variant="secondary" icon={Share2} onClick={() => setShareModalOpen(true)}>
            Share
          </Button> */}

          <Button variant="outline" icon={CheckCircle} onClick={() => setStatusModalOpen(true)}>
            Status
          </Button>

          {canEditGatePass(user) && (
            <Link href={`/gatepass/${pass.id}/edit`} style={{ textDecoration: 'none' }}>
              <Button variant="outline" icon={Edit}>
                Edit Pass
              </Button>
            </Link>
          )}

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
      {/* Linked Return Pass Banner (on Outward Pass) */}
      {(pass.return_gatepass?.id || pass.return_gatepass_id) && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw style={{ width: 20, height: 20, color: '#166534' }} />
            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#166534' }}>
                LINKED RETURN (INWARD) GATE PASS CREATED
              </span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-800)', margin: 0 }}>
                Return pass created: <strong>{pass.return_gatepass?.display_id || pass.return_gatepass_id}</strong>
              </p>
            </div>
          </div>
          <Link href={`/gatepass/${pass.return_gatepass?.id || pass.return_gatepass_id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">View Return Inward Pass</Button>
          </Link>
        </div>
      )}

      {/* Linked Outward Pass Banner (on Inward Pass) */}
      {(pass.linked_gatepass_id || pass.linked_gatepass?.id) && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--pink-50, #fdf2f8)',
            border: '1px solid var(--pink-200, #fbcfe8)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw style={{ width: 20, height: 20, color: 'var(--pink-700, #be185d)' }} />
            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--pink-700, #be185d)' }}>
                LINKED ORIGINAL OUTWARD GATE PASS
              </span>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-800)', margin: 0 }}>
                This inward return pass is linked to Outward Pass: <strong>{pass.linked_gatepass?.display_id || pass.linked_gatepass_id}</strong>
              </p>
            </div>
          </div>
          <Link href={`/gatepass/${pass.linked_gatepass?.id || pass.linked_gatepass_id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">View Original Outward Pass</Button>
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
            Gate Pass Preview
          </button>

          {canViewAuditTrail(user) && (
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
          )}
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
            <Card header="1. Recipient & Route Details (प्रती व उपकेंद्र)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>RECIPIENT (प्रती)</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {pass.recipient_name} ({pass.recipient_designation || 'Staff'})
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>ORIGIN OFFICE (कोणाकडून)</span>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-800)' }}>
                    {pass.from_office?.name || pass.fromSubstation || 'Sub Division Dondaicha'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>DESTINATION SUBSTATION (जायचे ठिकाण)</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {pass.destination_substation}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                    Section: {pass.destination_section || '-'} • Division: {pass.destination_division || '-'}
                  </div>
                </div>
              </div>
            </Card>

            <Card header="2. Transport & Contractor Details (चालक व गाडी)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>DRIVER NAME & PHONE</span>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {pass.driver_name || 'TBD'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                    Phone: {pass.driver_mobile || 'N/A'} {pass.driver_id ? `• Driver ID: ${pass.driver_id}` : ''}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>VEHICLE REGISTRATION NUMBER</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-800)' }}>
                    {pass.vehicle_number || 'TBD'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>CONTRACTOR / VENDOR (ठेकेदारास)</span>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)' }}>
                    {pass.contractor_name || pass.contractor?.company_name || pass.contractor?.name || '-'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Transformer & Material Table */}
          <Card header="3. Material / Transformer Details & Technical Job Records (मालाचे वर्णन व तांत्रिक नोंद)" style={{ marginBottom: '1.5rem' }}>
            <Table
              columns={materialColumns}
              data={pass.materials || []}
              emptyMessage="No material details recorded"
            />

            {/* Detailed Technical Job Records for each material item */}
            {pass.materials && pass.materials.map((m, index) => {
              const hasFailedRecord = Boolean(m.failed_job_record);
              const hasHealthyRecord = Boolean(m.healthy_job_record);

              return (
                <div
                  key={m.id || index}
                  style={{
                    marginTop: '1.25rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--gray-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gray-900)' }}>
                      Item #{m.sr_no || index + 1}: {m.capacity} {m.make} (Sr. No: {m.serial_number || 'N/A'})
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: 'var(--text-xs)' }}>
                      {m.job_number && <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>Job #: {m.job_number}</span>}
                      {m.group_number && <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f3e8ff', color: '#6b21a8', fontWeight: 600 }}>Group #: {m.group_number}</span>}
                      {m.village_name && <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Village: {m.village_name}</span>}
                    </div>
                  </div>

                  {/* Failed Job Record Box */}
                  {hasFailedRecord && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚠️ Failed Job Technical Inspection Record (जळालेले/दुरुस्तीयोग्य रोहित्र नोंद)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: 'var(--text-xs)' }}>
                        <div><strong style={{ color: '#7f1d1d' }}>GP Reading:</strong> {m.failed_job_record.gp_reading || '-'}</div>
                        <div><strong style={{ color: '#7f1d1d' }}>Fresh Reading:</strong> {m.failed_job_record.fresh_reading || '-'}</div>
                        <div><strong style={{ color: '#7f1d1d' }}>Oil Drain Sr. No:</strong> {m.failed_job_record.oil_drain_serial_number || '-'}</div>
                        <div><strong style={{ color: '#7f1d1d' }}>Recorded By CPF:</strong> {m.failed_job_record.recorded_by_cpf || pass.line_staff_cpf || '-'}</div>
                      </div>
                    </div>
                  )}

                  {/* Healthy Job Record Box */}
                  {hasHealthyRecord && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✅ Healthy / Repaired Job Technical Test Certificate (सुस्थिती रोहित्र चाचणी नोंद)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: 'var(--text-xs)' }}>
                        <div><strong style={{ color: '#14532d' }}>R-Phase Reading:</strong> {m.healthy_job_record.ryb_r_reading || '-'}</div>
                        <div><strong style={{ color: '#14532d' }}>Y-Phase Reading:</strong> {m.healthy_job_record.ryb_y_reading || '-'}</div>
                        <div><strong style={{ color: '#14532d' }}>B-Phase Reading:</strong> {m.healthy_job_record.ryb_b_reading || '-'}</div>
                        <div><strong style={{ color: '#14532d' }}>Spark Test:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{m.healthy_job_record.spark_test || 'OK'}</span></div>
                        <div><strong style={{ color: '#14532d' }}>Tested By CPF:</strong> {m.healthy_job_record.tested_by_cpf || pass.line_staff_cpf || '-'}</div>
                      </div>
                    </div>
                  )}

                  {m.remarks && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', fontStyle: 'italic' }}>
                      <strong>Item Note:</strong> {m.remarks}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Line Staff & Authorities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Card header="4. Line Staff & Issuing Authority Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-sm)' }}>
                <div><strong>Inspection Staff Name:</strong> {pass.line_staff_name || '-'}</div>
                <div><strong>Staff Mobile Phone:</strong> {pass.line_staff_mobile || '-'}</div>
                <div><strong>Staff CPF Number:</strong> {pass.line_staff_cpf || '-'}</div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8, marginTop: 4 }}>
                  <strong>Issued By (Sender / देणारे):</strong> {pass.sender_name} ({pass.sender_designation || 'SDO'}) {pass.sender_cpf ? `• CPF: ${pass.sender_cpf}` : ''}
                </div>
                {pass.receiver_name && (
                  <div>
                    <strong>Received By (Receiver / घेणारे):</strong> {pass.receiver_name} ({pass.receiver_designation || 'AE'})
                  </div>
                )}
              </div>
            </Card>

            <Card header="5. Check & Condition Certificate (शेरा)">
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-800)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {pass.remarks || 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.'}
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

      {viewMode === 'audit' && canViewAuditTrail(user) && (
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
