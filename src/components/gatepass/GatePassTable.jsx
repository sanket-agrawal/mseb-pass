'use client';

import React, { useState, useEffect } from 'react';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getStatusBadgeVariant, getStatusLabel, formatShortDate } from '@/lib/utils';
import { downloadGatePass } from '@/lib/pdfService';
import { Eye, Download, ArrowRight, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthUser, canEditGatePass } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function GatePassTable({ passes = [], onView, onDownload }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const handlePdfDownload = async (e, pass) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(pass);
      return;
    }
    toast.loading(`Generating PDF for ${pass.id}...`, { id: `tbl-pdf-${pass.id}` });
    try {
      await downloadGatePass(pass);
      toast.success(`PDF downloaded for ${pass.id}`, { id: `tbl-pdf-${pass.id}` });
    } catch (err) {
      toast.error('Failed to download PDF', { id: `tbl-pdf-${pass.id}` });
    }
  };

  const columns = [
    {
      header: 'Gate Pass ID',
      accessorKey: 'id',
      cell: (row) => {
        const isOutward = row.type === 'outward' || row.gatePassType === 'outward';
        return (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-700)' }}>
              {row.id}
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: isOutward ? 'var(--accent-100)' : 'var(--pink-100)',
                color: isOutward ? 'var(--accent-700)' : 'var(--pink-700)',
                border: isOutward ? '1px solid var(--accent-200)' : '1px solid var(--pink-200)',
                textTransform: 'uppercase'
              }}
            >
              {isOutward ? 'OUTWARD जावक' : 'INWARD आवक'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Transformer',
      accessorKey: 'materials',
      cell: (row) => {
        const mat = row.materials?.[0] || {};
        const cap = mat.capacity || row.transformerCapacity || 'Transformer';
        const make = mat.make || row.transformerMake || '';
        const srNo = mat.serial_number || row.transformerSrNo || '-';
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
              {cap} {make ? `- ${make}` : ''}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>
              Sr: {srNo}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Route (From → To)',
      accessorKey: 'destination_substation',
      cell: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{row.fromSubstation || 'Dondaicha Depot'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
            <ArrowRight style={{ width: 12, height: 12 }} />
            <span>{row.destination_substation || row.toSubstation || '-'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Driver & Vehicle',
      accessorKey: 'driver_name',
      cell: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{row.driver_name || row.driverName}</div>
          <div style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>{row.vehicle_number || row.vehicleNo}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
          {formatShortDate(row.date || row.issueDate)}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {getStatusLabel(row.status)}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      align: 'right',
      cell: (row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" title="View Details" onClick={(e) => { e.stopPropagation(); onView && onView(row); }}>
            <Eye style={{ width: 16, height: 16 }} />
          </Button>
          {canEditGatePass(user) && (
            <Button
              variant="ghost"
              size="sm"
              title="Edit Gate Pass"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/gatepass/${row.id}/edit`);
              }}
            >
              <Edit style={{ width: 16, height: 16, color: 'var(--primary-600)' }} />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Download PDF" onClick={(e) => handlePdfDownload(e, row)}>
            <Download style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={passes}
      onRowClick={onView}
      emptyMessage="No Gate Passes Found"
      emptyDescription="Create your first gate pass using the New Pass button."
    />
  );
}
