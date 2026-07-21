'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getStatusBadgeVariant, getStatusLabel, formatShortDate } from '@/lib/utils';
import { downloadGatePass } from '@/lib/pdfService';
import { Truck, ArrowRight, Calendar, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GatePassCard({ pass, onView, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  if (!pass) return null;

  const isOutward = pass.type === 'outward' || pass.gatePassType === 'outward';

  const handlePdfClick = async (e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(pass);
      return;
    }
    setDownloading(true);
    toast.loading(`Generating PDF for ${pass.id}...`, { id: `card-pdf-${pass.id}` });
    try {
      await downloadGatePass(pass);
      toast.success(`PDF downloaded for ${pass.id}`, { id: `card-pdf-${pass.id}` });
    } catch (err) {
      toast.error('Failed to download PDF', { id: `card-pdf-${pass.id}` });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar: Pass Number & Type & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isOutward ? 'var(--primary-100)' : 'var(--accent-100)',
              color: isOutward ? 'var(--primary-800)' : 'var(--accent-700)',
              textTransform: 'uppercase'
            }}
          >
            {isOutward ? 'OUTWARD जावक' : 'INWARD आवक'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gray-900)' }}>
            {pass.id}
          </span>
        </div>

        <Badge variant={getStatusBadgeVariant(pass.status)}>
          {getStatusLabel(pass.status)}
        </Badge>
      </div>

      {/* Transformer Details */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--gray-50)',
          border: '1px solid var(--gray-200)',
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>TRANSFORMER</div>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-900)' }}>
          {pass.materials?.[0]?.capacity || pass.transformerCapacity || 'Transformer'} - {pass.materials?.[0]?.make || pass.transformerMake || 'MSEDCL Unit'}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', fontFamily: 'var(--font-mono)' }}>
          Sr. No: {pass.materials?.[0]?.serial_number || pass.transformerSrNo || '-'}
        </div>
      </div>

      {/* Route Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 'var(--text-xs)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: 'var(--gray-400)', display: 'block' }}>FROM</span>
          <span style={{ fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {pass.fromSubstation || 'Dondaicha Depot'}
          </span>
        </div>

        <ArrowRight style={{ width: 16, height: 16, color: 'var(--accent-500)', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: 'var(--gray-400)', display: 'block' }}>TO</span>
          <span style={{ fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {pass.destination_substation || pass.toSubstation || 'Destination'}
          </span>
        </div>
      </div>

      {/* Driver & Date Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs)',
          color: 'var(--gray-600)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Truck style={{ width: 14, height: 14, color: 'var(--gray-400)' }} />
          <span>{pass.driver_name || pass.driverName} ({pass.vehicle_number || pass.vehicleNo})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar style={{ width: 14, height: 14, color: 'var(--gray-400)' }} />
          <span>{formatShortDate(pass.date || pass.issueDate)}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button variant="outline" size="sm" fullWidth icon={Eye} onClick={() => onView && onView(pass)}>
          View
        </Button>
        <Button variant="secondary" size="sm" icon={Download} loading={downloading} onClick={handlePdfClick}>
          PDF
        </Button>
      </div>
    </Card>
  );
}
