'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import Pagination from '@/components/ui/Pagination';
import AssetUploadModal from '@/components/assets/AssetUploadModal';
import { sectionAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  FolderTree,
  Zap,
  MapPin,
  RefreshCw,
  UploadCloud
} from 'lucide-react';

export default function SectionAssetsModal({ section, isOpen, onClose }) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Section asset upload modal state
  const [selectedAssetForUpload, setSelectedAssetForUpload] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isFirstMount = useRef(true);

  const loadAssets = useCallback(async (targetPage = page, targetLimit = limit, targetSearch = search) => {
    if (!section?.id) return;
    try {
      setIsLoading(true);
      const query = {
        page: targetPage,
        limit: targetLimit,
      };
      if (targetSearch && targetSearch.trim()) {
        query.search = targetSearch.trim();
      }

      const res = await sectionAPI.listAssets(section.id, query);
      if (res && res.data) {
        const assetList = Array.isArray(res.data) ? res.data : (res.data.assets || []);
        setAssets(assetList);

        if (res.pagination) {
          setTotalItems(res.pagination.total ?? assetList.length);
          setTotalPages(res.pagination.totalPages ?? Math.max(1, Math.ceil((res.pagination.total || assetList.length) / targetLimit)));
        } else {
          setTotalItems(assetList.length);
          setTotalPages(Math.max(1, Math.ceil(assetList.length / targetLimit)));
        }
      }
    } catch (err) {
      console.error('Failed to load section assets', err);
      toast.error('Failed to load assets for this section');
    } finally {
      setIsLoading(false);
    }
  }, [section?.id]);

  useEffect(() => {
    if (isOpen && section?.id) {
      setPage(1);
      setSearch('');
      isFirstMount.current = true;
      loadAssets(1, limit, '');
    } else {
      setAssets([]);
    }
  }, [isOpen, section?.id, limit, loadAssets]);

  // Debounced search inside modal
  useEffect(() => {
    if (!isOpen || !section?.id) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      loadAssets(1, limit, search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, isOpen, section?.id, limit, loadAssets]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadAssets(newPage, limit, search);
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    loadAssets(1, newLimit, search);
  };

  const handleOpenUploadModal = (asset) => {
    setSelectedAssetForUpload(asset);
    setIsUploadModalOpen(true);
  };

  const columns = [
    {
      header: 'Asset / DTC Code',
      accessorKey: 'asset_code',
      cell: (row) => (
        <div style={{ minWidth: '150px' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', whiteSpace: 'nowrap' }}>
            {row.dtc_number ? `DTC-${row.dtc_number}` : row.asset_code}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px', whiteSpace: 'nowrap' }}>
            S/N: {row.serial_number || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Capacity & Phase',
      cell: (row) => (
        <div style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>{row.capacity || '—'}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: row.phase === 'SINGLE' ? '#e0f2fe' : '#fef3c7',
              color: row.phase === 'SINGLE' ? '#0369a1' : '#b45309',
              fontWeight: 700
            }}
          >
            {row.phase || 'THREE'} Phase
          </span>
        </div>
      ),
    },
    {
      header: 'Make & Condition',
      cell: (row) => (
        <div style={{ minWidth: '160px' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '13px' }}>{row.make || '—'}</div>
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'capitalize', display: 'inline-block', marginTop: '2px' }}>
            {row.condition || 'good'} • {row.status || 'in_stock'}
          </span>
        </div>
      ),
    },
    {
      header: 'Village / DTC Location',
      cell: (row) => (
        <div style={{ minWidth: '160px', fontSize: '13px' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{row.village_name || row.location_office?.name || '—'}</div>
          {row.latitude && row.longitude ? (
            <div style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', whiteSpace: 'nowrap' }}>
              <MapPin size={11} style={{ color: 'var(--primary-600)' }} />
              <span>{Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Files',
      cell: (row) => (
        <div style={{ minWidth: '85px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={UploadCloud}
            onClick={() => handleOpenUploadModal(row)}
            title="Upload / View Section Asset Files"
            style={{ color: 'var(--primary-700)', backgroundColor: 'var(--primary-50)', whiteSpace: 'nowrap' }}
          >
            Files
          </Button>
        </div>
      ),
    },
  ];

  if (!isOpen || !section) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FolderTree size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--gray-900)' }}>
                {section.name}
              </span>
              {section.code && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--gray-100)',
                    color: 'var(--gray-700)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)'
                  }}
                >
                  {section.code}
                </span>
              )}
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-700)',
                  fontWeight: 600
                }}
              >
                Sub-Division: {section.parent_name || 'Dondaicha'}
              </span>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} style={{ color: '#d97706' }} />
              <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontWeight: 700 }}>
                Total: {totalItems.toLocaleString()} Transformers registered in {section.name}
              </span>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Search and Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <SearchInput
              placeholder={`Search DTC, serial number, make, village in ${section.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              maxWidth="420px"
            />

            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              onClick={() => loadAssets(page, limit, search)}
              title="Refresh inventory"
            >
              Refresh
            </Button>
          </div>

          {/* Table Container with spacious layout */}
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ minWidth: '740px' }}>
              <Table
                columns={columns}
                data={assets}
                isLoading={isLoading}
                emptyMessage={
                  search
                    ? `No transformers matching "${search}" in ${section.name}.`
                    : `No transformers registered under ${section.name} yet.`
                }
              />
            </div>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={limit}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={isLoading}
            itemName="transformers"
          />
        </div>
      </Modal>

      {/* Section Asset Upload Modal (Isolated under category="section", unconstrained upload) */}
      {selectedAssetForUpload && (
        <AssetUploadModal
          asset={selectedAssetForUpload}
          isOpen={isUploadModalOpen}
          category="section"
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedAssetForUpload(null);
          }}
          onUpdated={() => loadAssets(page, limit, search)}
        />
      )}
    </>
  );
}
