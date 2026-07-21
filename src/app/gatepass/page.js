'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassTable from '@/components/gatepass/GatePassTable';
import GatePassCard from '@/components/gatepass/GatePassCard';
import StatusUpdateModal from '@/components/gatepass/StatusUpdateModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useGatePass } from '@/hooks/useGatePass';
import { exportGatePassesToExcel } from '@/lib/excelExport';
import { Plus, Search, LayoutGrid, List, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function GatePassDirectoryPage() {
  const router = useRouter();
  const { passes, loading, updateStatus } = useGatePass();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedPassForStatus, setSelectedPassForStatus] = useState(null);

  const filteredPasses = passes.filter((p) => {
    // Status tab filter
    if (activeTab === 'outward' && p.type !== 'outward') return false;
    if (activeTab === 'inward' && p.type !== 'inward') return false;
    if (activeTab === 'in_transit' && p.status !== 'in_transit' && p.status !== 'return_in_transit') return false;
    if (activeTab === 'delivered' && p.status !== 'delivered' && p.status !== 'completed') return false;

    // Type filter dropdown
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = (p.id || '').toLowerCase().includes(q);
      const matchSerial = String(p.serial_number || '').includes(q);
      const matchDriver = (p.driver_name || '').toLowerCase().includes(q);
      const matchSub = (p.destination_substation || '').toLowerCase().includes(q);
      const matchMat = (p.materials || []).some(m =>
        (m.serial_number || '').toLowerCase().includes(q) ||
        (m.make || '').toLowerCase().includes(q)
      );
      return matchId || matchSerial || matchDriver || matchSub || matchMat;
    }

    return true;
  });

  const handleView = (pass) => {
    router.push(`/gatepass/${pass.id}`);
  };

  const handleDownload = (pass) => {
    toast.success(`Preparing PDF for ${pass.id}`);
  };

  const handleStatusModalConfirm = (newStatus, remarks) => {
    if (selectedPassForStatus) {
      updateStatus(selectedPassForStatus.id, newStatus, remarks);
      toast.success(`Updated ${selectedPassForStatus.id} status to ${newStatus}`);
      setSelectedPassForStatus(null);
    }
  };

  const handleExportFiltered = () => {
    if (filteredPasses.length === 0) {
      toast.error('No gate passes match the current filter criteria');
      return;
    }
    toast.loading(`Exporting ${filteredPasses.length} records...`, { id: 'directory-export' });
    try {
      const filename = exportGatePassesToExcel(filteredPasses);
      toast.success(`Exported to ${filename}`, { id: 'directory-export' });
    } catch (e) {
      toast.error('Failed to export to Excel', { id: 'directory-export' });
    }
  };

  return (
    <PageWrapper
      title="Gate Pass Directory"
      subtitle="Comprehensive registry of all transformer transport gate passes (आवक व जावक पास)."
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportFiltered}>
            Export Filtered ({filteredPasses.length})
          </Button>
          <Link href="/gatepass/new" style={{ textDecoration: 'none' }}>
            <Button variant="accent" icon={Plus}>
              New Gate Pass
            </Button>
          </Link>
        </div>
      }
    >
      {/* Control & Filter Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--gray-100)', padding: '4px', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Passes' },
              { id: 'outward', label: 'Outward (जावक)' },
              { id: 'inward', label: 'Inward (आवक)' },
              { id: 'in_transit', label: 'In Transit' },
              { id: 'delivered', label: 'Delivered / Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--gray-600)',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + View Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: 240 }}>
              <Input
                placeholder="Search GP#, Driver, Substation..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? 'var(--primary-600)' : 'var(--bg-surface)',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--gray-600)',
                  cursor: 'pointer'
                }}
              >
                <List style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--primary-600)' : 'var(--bg-surface)',
                  color: viewMode === 'grid' ? '#ffffff' : 'var(--gray-600)',
                  cursor: 'pointer'
                }}
              >
                <LayoutGrid style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main View */}
      {viewMode === 'table' ? (
        <GatePassTable
          passes={filteredPasses}
          onView={handleView}
          onDownload={handleDownload}
          loading={loading}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredPasses.map((pass) => (
            <GatePassCard
              key={pass.id}
              pass={pass}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Status Modal */}
      {selectedPassForStatus && (
        <StatusUpdateModal
          isOpen={!!selectedPassForStatus}
          onClose={() => setSelectedPassForStatus(null)}
          currentStatus={selectedPassForStatus.status}
          onConfirm={handleStatusModalConfirm}
        />
      )}
    </PageWrapper>
  );
}
