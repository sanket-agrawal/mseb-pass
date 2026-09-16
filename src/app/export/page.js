'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { gatePassAPI, officeAPI, driverAPI, exportAPI } from '@/lib/api';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExportPage() {
  const [passes, setPasses] = useState([]);
  const [offices, setOffices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [substationFilter, setSubstationFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [passRes, officeRes, driverRes] = await Promise.all([
        gatePassAPI.list({ all: true }),
        officeAPI.list(),
        driverAPI.list(),
      ]);
      if (passRes?.data) setPasses(passRes.data.gatepasses || passRes.data || []);
      if (officeRes?.data) setOffices(officeRes.data || []);
      if (driverRes?.data) setDrivers(driverRes.data.drivers || driverRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPasses = passes.filter(p => {
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (substationFilter !== 'all' && (p.destination_substation) !== substationFilter) return false;
    if (driverFilter !== 'all' && (p.driver_name) !== driverFilter) return false;
    return true;
  });

  const handleExportClick = async () => {
    setExporting(true);
    toast.loading('Generating Excel workbook from server...', { id: 'export-toast' });
    try {
      const filters = {
        from_date: dateFrom,
        to_date: dateTo,
        status: statusFilter,
        type: typeFilter,
      };
      const blob = await exportAPI.excel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gatepasses-${Date.now()}.xlsx`;
      a.click();
      toast.success(`Exported Excel report successfully!`, { id: 'export-toast' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel workbook', { id: 'export-toast' });
    } finally {
      setExporting(false);
    }
  };

  const previewColumns = [
    { header: 'GP ID', accessorKey: 'display_id', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.display_id || r.id}</span> },
    { header: 'Date', accessorKey: 'date', cell: (r) => <span>{r.date ? new Date(r.date).toISOString().split('T')[0] : ''}</span> },
    { header: 'Type', accessorKey: 'type', cell: (r) => <span>{r.type === 'outward' ? 'Outward जावक' : 'Inward आवक'}</span> },
    { header: 'Recipient & Substation', accessorKey: 'destination_substation', cell: (r) => <span>{r.destination_substation}</span> },
    { header: 'Driver', accessorKey: 'driver_name', cell: (r) => <span>{r.driver_name || 'TBD'}</span> },
    { header: 'Vehicle No.', accessorKey: 'vehicle_number', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.vehicle_number || 'TBD'}</span> },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <PageWrapper
      title="Excel Data Export"
      subtitle="Filter, customize, and export gate pass logs directly to Microsoft Excel (.xlsx)."
      actions={
        <Button variant="accent" icon={FileSpreadsheet} loading={exporting} onClick={handleExportClick}>
          Export to Excel (.xlsx)
        </Button>
      }
    >
      {/* Filter Parameters Card */}
      <Card header="1. Filter Export Criteria" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Date From (दिनांक पासून)"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <Input
            label="Date To (दिनांक पर्यंत)"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          <Select
            label="Gate Pass Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { label: 'All Types (सर्व पास)', value: 'all' },
              { label: 'Outward (जावक)', value: 'outward' },
              { label: 'Inward (आवक)', value: 'inward' },
            ]}
          />

          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft (मसुदा)', value: 'draft' },
              { label: 'Issued (निर्गमित)', value: 'issued' },
              { label: 'In Transit (मार्गावर)', value: 'in_transit' },
              { label: 'Delivered (पोहोचले)', value: 'delivered' },
              { label: 'Completed (पूर्ण)', value: 'completed' },
            ]}
          />

          <Select
            label="Substation"
            value={substationFilter}
            onChange={(e) => setSubstationFilter(e.target.value)}
            options={[
              { label: 'All Substations', value: 'all' },
              ...offices.map(s => ({ label: s.name, value: s.name }))
            ]}
          />

          <Select
            label="Driver"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            options={[
              { label: 'All Drivers', value: 'all' },
              ...drivers.map(d => ({ label: d.name, value: d.name }))
            ]}
          />
        </div>
      </Card>

      {/* Live Preview Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>2. Export Record Preview</span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-700)' }}>
              Matching Records: {filteredPasses.length}
            </span>
          </div>
        }
      >
        <Table
          columns={previewColumns}
          data={filteredPasses.slice(0, 10)}
          loading={loading}
          emptyMessage="No matching records found"
          emptyDescription="Adjust your filter parameters above to display matching gate pass entries."
        />

        {filteredPasses.length > 10 && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Showing first 10 of {filteredPasses.length} matching rows in preview. All {filteredPasses.length} records will be exported to Excel.
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
