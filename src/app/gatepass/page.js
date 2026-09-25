'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import GatePassTable from '@/components/gatepass/GatePassTable';
import GatePassCard from '@/components/gatepass/GatePassCard';
import StatusUpdateModal from '@/components/gatepass/StatusUpdateModal';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { gatePassAPI, exportAPI } from '@/lib/api';
import { Plus, LayoutGrid, List, FileSpreadsheet, RefreshCw, FileQuestion } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthUser, canCreateGatePass } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'all', label: 'All Passes' },
  { id: 'outward', label: 'Outward (जावक)', type: 'outward' },
  { id: 'inward', label: 'Inward (आवक)', type: 'inward' },
];

export default function GatePassDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedPassForStatus, setSelectedPassForStatus] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isFirstMount = useRef(true);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const fetchPasses = useCallback(async (targetPage = page, targetLimit = limit, targetTab = activeTab, targetSearch = search) => {
    setLoading(true);
    try {
      const filters = {
        page: targetPage,
        limit: targetLimit,
      };

      const selectedTabObj = TABS.find((t) => t.id === targetTab);
      if (selectedTabObj?.type) {
        filters.type = selectedTabObj.type;
      }
      if (selectedTabObj?.status) {
        filters.status = selectedTabObj.status;
      }

      if (targetSearch && targetSearch.trim()) {
        filters.search = targetSearch.trim();
      }

      const res = await gatePassAPI.list(filters);
      if (res && res.data) {
        const passList = Array.isArray(res.data) ? res.data : (res.data.gatepasses || []);
        setPasses(passList);

        if (res.pagination) {
          setTotalItems(res.pagination.total ?? passList.length);
          setTotalPages(res.pagination.totalPages ?? Math.max(1, Math.ceil((res.pagination.total || passList.length) / targetLimit)));
        } else {
          setTotalItems(passList.length);
          setTotalPages(Math.max(1, Math.ceil(passList.length / targetLimit)));
        }
      }
    } catch (err) {
      console.error('Failed to load gate passes:', err);
      toast.error('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, search]);

  // Debounced search effect
  useEffect(() => {
    if (isFirstMount.current) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchPasses(1, limit, activeTab, search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Page / Limit / Tab changes effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchPasses(1, limit, activeTab, search);
      return;
    }
    fetchPasses(page, limit, activeTab, search);
  }, [page, limit, activeTab]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReload = () => {
    fetchPasses(page, limit, activeTab, search);
  };

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
        fetchPasses(page, limit, activeTab, search);
      } catch (err) {
        toast.error(err.message || 'Status update failed');
      }
    }
  };

  const handleExportFiltered = async () => {
    toast.loading(`Exporting gate passes...`, { id: 'directory-export' });
    try {
      const filters = { all: true };
      const selectedTabObj = TABS.find((t) => t.id === activeTab);
      if (selectedTabObj?.type) filters.type = selectedTabObj.type;
      if (selectedTabObj?.status) filters.status = selectedTabObj.status;
      if (search && search.trim()) filters.search = search.trim();

      const blob = await exportAPI.excel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gatepasses-${Date.now()}.xlsx`;
      a.click();
      toast.success(`Exported Excel workbook successfully!`, { id: 'directory-export' });
    } catch (e) {
      console.error(e);
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
            Export Excel ({totalItems})
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
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--gray-100)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap'
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
              placeholder="Search GP#, Driver, Substation, Sr No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              maxWidth="280px"
              size="sm"
            />

            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReload} disabled={loading}>
              Reload
            </Button>

            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('table')}
                aria-label="Table View"
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
                aria-label="Grid View"
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
          passes={passes}
          onView={handleView}
          onDownload={handleDownload}
          loading={loading}
        />
      ) : loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ padding: '1.5rem', height: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%' }} />
              <div className="skeleton" style={{ height: '18px', width: '80%' }} />
              <div className="skeleton" style={{ height: '18px', width: '60%' }} />
              <div className="skeleton" style={{ height: '32px', width: '100%', marginTop: 'auto' }} />
            </Card>
          ))}
        </div>
      ) : passes.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No Gate Passes Found"
          description={search ? `No passes matching "${search}". Try adjusting your search query or active filter tab.` : "There are no gate passes found for this filter."}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {passes.map((pass) => (
            <GatePassCard
              key={pass.id}
              pass={pass}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        itemName="gate passes"
      />

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
