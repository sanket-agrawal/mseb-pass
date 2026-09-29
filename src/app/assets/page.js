'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import SearchInput from '@/components/ui/SearchInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Pagination from '@/components/ui/Pagination';
import { assetAPI, officeAPI } from '@/lib/api';
import { TRANSFORMER_CAPACITY, ASSET_PHASE } from '@/lib/constants';
import { getAuthUser, canManageAssets } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Zap, MapPin, RefreshCw, UploadCloud } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import AssetUploadModal from '@/components/assets/AssetUploadModal';

export default function AssetsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [offices, setOffices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedAssetForUpload, setSelectedAssetForUpload] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isFirstMount = useRef(true);

  const [formData, setFormData] = useState({
    asset_code: '',
    type: 'Transformer',
    make: '',
    serial_number: '',
    capacity: '63 KVA',
    dtc_number: '',
    village_name: '',
    location_office_id: '',
    condition: 'good',
    status: 'in_stock',
    latitude: '',
    longitude: '',
    phase: 'THREE',
  });

  // Verify access for admin & super_admin
  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    if (authUser && !canManageAssets(authUser)) {
      toast.error('Access restricted to Admin and Super Admin roles');
      router.push('/dashboard');
    }
  }, [router]);

  const fetchOffices = async () => {
    try {
      const offRes = await officeAPI.list();
      setOffices(offRes.data || offRes.offices || []);
    } catch (err) {
      console.error('Failed to load offices', err);
    }
  };

  const loadData = useCallback(async (targetPage = page, targetLimit = limit, targetSearch = search) => {
    try {
      setIsLoading(true);
      const query = {
        page: targetPage,
        limit: targetLimit,
      };
      if (targetSearch && targetSearch.trim()) {
        query.search = targetSearch.trim();
      }

      const assetRes = await assetAPI.list(query);
      if (assetRes && assetRes.data) {
        const assetList = Array.isArray(assetRes.data) ? assetRes.data : (assetRes.data.assets || []);
        setAssets(assetList);

        if (assetRes.pagination) {
          setTotalItems(assetRes.pagination.total ?? assetList.length);
          setTotalPages(assetRes.pagination.totalPages ?? Math.max(1, Math.ceil((assetRes.pagination.total || assetList.length) / targetLimit)));
        } else {
          setTotalItems(assetList.length);
          setTotalPages(Math.max(1, Math.ceil(assetList.length / targetLimit)));
        }
      }
    } catch (err) {
      console.error('Failed to load assets', err);
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffices();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (isFirstMount.current) return;
    const timer = setTimeout(() => {
      setPage(1);
      loadData(1, limit, search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, limit, loadData]);

  // Page / Limit change effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadData(1, limit, search);
      return;
    }
    loadData(page, limit, search);
  }, [page, limit, loadData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReload = () => {
    loadData(page, limit, search);
  };

  const handleOpenUploadModal = (asset) => {
    setSelectedAssetForUpload(asset);
    setIsUploadModalOpen(true);
  };

  const handleOpenModal = (asset = null) => {
    if (asset) {
      setEditingId(asset.id);
      setFormData({
        asset_code: asset.asset_code || '',
        type: asset.type || 'Transformer',
        make: asset.make || '',
        serial_number: asset.serial_number || '',
        capacity: asset.capacity || '63 KVA',
        dtc_number: asset.dtc_number || '',
        village_name: asset.village_name || '',
        location_office_id: asset.location_office_id || '',
        condition: asset.condition || 'good',
        status: asset.status || 'in_stock',
        latitude: asset.latitude || '',
        longitude: asset.longitude || '',
        phase: asset.phase || 'THREE',
      });
    } else {
      setEditingId(null);
      setFormData({
        asset_code: '',
        type: 'Transformer',
        make: '',
        serial_number: '',
        capacity: '63 KVA',
        dtc_number: '',
        village_name: '',
        location_office_id: '',
        condition: 'good',
        status: 'in_stock',
        latitude: '',
        longitude: '',
        phase: 'THREE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await assetAPI.update(editingId, formData);
        toast.success('Asset updated successfully');
      } else {
        await assetAPI.create(formData);
        toast.success('Asset created successfully');
      }
      setIsModalOpen(false);
      loadData(page, limit, search);
    } catch (err) {
      toast.error(err.message || 'Failed to save asset');
    }
  };

  const columns = [
    {
      header: 'Asset / DTC Code',
      accessorKey: 'asset_code',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--primary-800)' }}>
            {row.dtc_number ? `DTC-${row.dtc_number}` : row.asset_code}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
            S/N: {row.serial_number || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Capacity & Phase',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.capacity || '—'}</div>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: row.phase === 'SINGLE' ? '#e0f2fe' : '#fef3c7',
            color: row.phase === 'SINGLE' ? '#0369a1' : '#b45309',
            fontWeight: 700
          }}>
            {row.phase || 'THREE'} Phase
          </span>
        </div>
      ),
    },
    {
      header: 'Make & Condition',
      cell: (row) => (
        <div>
          <div>{row.make || '—'}</div>
          <span style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'capitalize' }}>
            {row.condition} • {row.status}
          </span>
        </div>
      ),
    },
    {
      header: 'Location / Coordinates',
      cell: (row) => (
        <div style={{ fontSize: '13px' }}>
          <div>{row.village_name || row.location_office?.name || '—'}</div>
          {row.latitude && row.longitude && (
            <div style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={11} /> {Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={UploadCloud}
            onClick={() => handleOpenUploadModal(row)}
            title="Upload / View Documents & Media"
            style={{ color: 'var(--primary-700)' }}
          >
            Files
          </Button>
          <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenModal(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Transformers & Assets"
      subtitle="Master inventory of DTC transformers, capacities, phases, and GPS coordinates."
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReload} title="Refresh assets">
            Refresh
          </Button>
          <Button variant="accent" icon={Plus} onClick={() => handleOpenModal()}>
            Add Asset
          </Button>
        </div>
      }
    >

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <SearchInput
            placeholder="Search DTC, serial number, make, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            maxWidth="400px"
          />
          {totalItems > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>
              Total: {totalItems.toLocaleString()} {totalItems === 1 ? 'transformer' : 'transformers'}
            </span>
          )}
        </div>

        <Table
          columns={columns}
          data={assets}
          isLoading={isLoading}
          emptyMessage={search ? `No assets matching "${search}".` : "No assets found."}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={isLoading}
          itemName="transformers"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Transformer' : 'New Transformer'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave}>
              Save Asset
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="DTC Number"
              placeholder="e.g. 55421"
              value={formData.dtc_number}
              onChange={(e) => setFormData(p => ({ ...p, dtc_number: e.target.value }))}
            />
            <Input
              label="Serial Number"
              placeholder="e.g. TR-2024-991"
              value={formData.serial_number}
              onChange={(e) => setFormData(p => ({ ...p, serial_number: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Capacity"
              value={formData.capacity}
              onChange={(e) => setFormData(p => ({ ...p, capacity: e.target.value }))}
              options={TRANSFORMER_CAPACITY.map(c => ({ value: c, label: c }))}
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
                Phase Type
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="phase"
                    value="THREE"
                    checked={formData.phase === 'THREE'}
                    onChange={() => setFormData(p => ({ ...p, phase: 'THREE' }))}
                  />
                  <span>Three Phase</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="phase"
                    value="SINGLE"
                    checked={formData.phase === 'SINGLE'}
                    onChange={() => setFormData(p => ({ ...p, phase: 'SINGLE' }))}
                  />
                  <span>Single Phase</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Make / Manufacturer"
              placeholder="e.g. Crompton / Kirloskar"
              value={formData.make}
              onChange={(e) => setFormData(p => ({ ...p, make: e.target.value }))}
            />
            <Input
              label="Village / DTC Location"
              placeholder="e.g. Vikharan"
              value={formData.village_name}
              onChange={(e) => setFormData(p => ({ ...p, village_name: e.target.value }))}
            />
          </div>

          <SearchableSelect
            label="Location Office"
            placeholder="Select office..."
            value={formData.location_office_id}
            onChange={(val) => setFormData(p => ({ ...p, location_office_id: val }))}
            options={offices.map(o => ({ value: o.id, label: `${o.name} (${o.type})` }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Latitude (GPS)"
              placeholder="e.g. 21.341234"
              value={formData.latitude}
              onChange={(e) => setFormData(p => ({ ...p, latitude: e.target.value }))}
            />
            <Input
              label="Longitude (GPS)"
              placeholder="e.g. 74.891234"
              value={formData.longitude}
              onChange={(e) => setFormData(p => ({ ...p, longitude: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {selectedAssetForUpload && (
        <AssetUploadModal
          asset={selectedAssetForUpload}
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedAssetForUpload(null);
          }}
          onUpdated={() => loadData(page, limit, search)}
        />
      )}
    </PageWrapper>
  );
}
