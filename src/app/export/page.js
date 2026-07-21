'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { useGatePass } from '@/hooks/useGatePass';
import { useDrivers } from '@/hooks/useDrivers';
import { exportGatePassesToExcel } from '@/lib/excelExport';
import { Download, Filter, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExportPage() {
  const { passes, loading } = useGatePass();
  const { drivers, substations } = useDrivers();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [substationFilter, setSubstationFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');

  const [sheetOptions, setSheetOptions] = useState({
    includeMaterials: true,
    includeSummary: true,
    includeDrivers: true
  });

  const [exporting, setExporting] = useState(false);

  // Apply filters to dataset
  const filteredPasses = passes.filter(p => {
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (substationFilter !== 'all' && (p.destination_substation || p.toSubstation) !== substationFilter) return false;
    if (driverFilter !== 'all' && (p.driver_name || p.driverName) !== driverFilter) return false;
    return true;
  });

  const handleExportClick = () => {
    if (filteredPasses.length === 0) {
      toast.error('No matching records found for the selected filters');
      return;
    }

    setExporting(true);
    toast.loading('Generating Excel workbook...', { id: 'export-toast' });
    try {
      const filename = exportGatePassesToExcel(filteredPasses, sheetOptions);
      toast.success(`Exported ${filteredPasses.length} records to ${filename}`, { id: 'export-toast' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel workbook', { id: 'export-toast' });
    } finally {
      setExporting(false);
    }
  };

  const previewColumns = [
    { header: 'GP ID', accessorKey: 'id', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.id}</span> },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Type', accessorKey: 'type', cell: (r) => <span>{r.type === 'outward' ? 'Outward जावक' : 'Inward आवक'}</span> },
    { header: 'Recipient & Substation', accessorKey: 'destination_substation', cell: (r) => <span>{r.destination_substation || r.toSubstation}</span> },
    { header: 'Driver', accessorKey: 'driver_name', cell: (r) => <span>{r.driver_name || r.driverName}</span> },
    { header: 'Vehicle No.', accessorKey: 'vehicle_number', cell: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.vehicle_number || r.vehicleNo}</span> },
    { header: 'Capacity', accessorKey: 'capacity', cell: (r) => <strong>{r.materials?.[0]?.capacity || r.transformerCapacity || '-'}</strong> },
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
              ...substations.map(s => ({ label: s.name, value: s.name }))
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

      {/* Sheet Customization Options */}
      <Card header="2. Workbook Worksheets & Options" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={true}
              disabled
              style={{ width: 18, height: 18 }}
            />
            Sheet 1: Gate Passes Summary (Always Included)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sheetOptions.includeMaterials}
              onChange={(e) => setSheetOptions(prev => ({ ...prev, includeMaterials: e.target.checked }))}
              style={{ width: 18, height: 18 }}
            />
            Sheet 2: Materials & Transformers Breakdown
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sheetOptions.includeSummary}
              onChange={(e) => setSheetOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
              style={{ width: 18, height: 18 }}
            />
            Sheet 3: Executive Metrics Summary
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sheetOptions.includeDrivers}
              onChange={(e) => setSheetOptions(prev => ({ ...prev, includeDrivers: e.target.checked }))}
              style={{ width: 18, height: 18 }}
            />
            Sheet 4: Driver Trips Leaderboard
          </label>
        </div>
      </Card>

      {/* Live Preview Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>3. Export Record Preview</span>
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
