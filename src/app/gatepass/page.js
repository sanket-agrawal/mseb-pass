'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassTable from '@/components/gatepass/GatePassTable';
import GatePassCard from '@/components/gatepass/GatePassCard';
import StatusUpdateModal from '@/components/gatepass/StatusUpdateModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SearchInput from '@/components/ui/SearchInput';
import Card from '@/components/ui/Card';
import { gatePassAPI, exportAPI } from '@/lib/api';
import { Plus, Search, LayoutGrid, List, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthUser, canCreateGatePass } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function GatePassDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedPassForStatus, setSelectedPassForStatus] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
    fetchPasses();
  }, [activeTab, typeFilter]);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (activeTab !== 'all' && activeTab !== 'in_transit' && activeTab !== 'delivered') {
        filters.type = activeTab;
      }
      if (activeTab === 'in_transit') filters.status = 'in_transit';
      if (activeTab === 'delivered') filters.status = 'delivered';
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (search) filters.search = search;

      const res = await gatePassAPI.list(filters);
      if (res && res.data) {
        setPasses(res.data.gatepasses || res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  const filteredPasses = passes.filter((p) => {
    // If user is Admin (not Super Admin), filter passes of user's division
    const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
    const isSuperAdmin = roles.includes('super_admin');
    const isAdmin = roles.includes('admin');

    if (isAdmin && !isSuperAdmin) {
      const userDiv = (user?.division || user?.office?.division || 'Dhule').toLowerCase();
      const passDiv = (p.destination_division || p.from_office?.division || 'Dhule').toLowerCase();
      
      const isDhuleDondaichaMatch = 
        (userDiv.includes('dhule') || userDiv.includes('dondaicha')) &&
        (passDiv.includes('dhule') || passDiv.includes('dondaicha'));

      if (!passDiv.includes(userDiv) && !userDiv.includes(passDiv) && !isDhuleDondaichaMatch) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = (p.display_id || p.id || '').toLowerCase().includes(q);
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
    toast.success(`Opening PDF preview for ${pass.display_id || pass.id}`);
  };

  const handleStatusModalConfirm = async (newStatus, remarks) => {
    if (selectedPassForStatus) {
      try {
        await gatePassAPI.updateStatus(selectedPassForStatus.id, newStatus, remarks);
        toast.success(`Updated ${selectedPassForStatus.display_id || selectedPassForStatus.id} status to ${newStatus}`);
        setSelectedPassForStatus(null);
        fetchPasses();
      } catch (err) {
        toast.error(err.message || 'Status update failed');
      }
    }
  };

  const handleExportFiltered = async () => {
    toast.loading(`Exporting gate passes...`, { id: 'directory-export' });
    try {
      const blob = await exportAPI.excel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gatepasses-${Date.now()}.xlsx`;
      a.click();
      toast.success(`Exported Excel workbook successfully!`, { id: 'directory-export' });
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
            Export Excel ({filteredPasses.length})
          </Button>
          {canCreateGatePass(user) && (
            <Link href="/gatepass/new" style={{ textDecoration: 'none' }}>
              <Button variant="accent" icon={Plus}>
                New Gate Pass
              </Button>
            </Link>
          )}
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
            <SearchInput
              placeholder="Search GP#, Driver, Substation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              maxWidth="280px"
              size="sm"
            />

            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchPasses}>
              Reload
            </Button>

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
