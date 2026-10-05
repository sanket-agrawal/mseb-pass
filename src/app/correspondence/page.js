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
import Pagination from '@/components/ui/Pagination';
import PageWrapper from '@/components/layout/PageWrapper';
import CorrespondenceModal from '@/components/correspondence/CorrespondenceModal';
import { agencyAPI } from '@/lib/api';
import { getAuthUser, canManageCorrespondence } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Building,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  FileSignature,
  Paperclip,
  Search,
  Filter,
  Layers,
  Wrench,
  CheckCircle,
  FileText
} from 'lucide-react';

const AGENCY_TYPES = [
  'Repair & Maintenance',
  'Transformer Testing',
  'Rewinding & Overhaul',
  'Oil Filtration & Dehydration',
  'Calibration & Testing',
  'Vendor / Material Supply',
  'Logistics & Transport',
  'Other'
];

export default function CorrespondencePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAgencyForDocs, setSelectedAgencyForDocs] = useState(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [deletingAgency, setDeletingAgency] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstMount = useRef(true);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Repair & Maintenance',
    contact: '',
    email: '',
    address: '',
  });

  // Verify access for Admin / Super Admin
  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    if (authUser && !canManageCorrespondence(authUser)) {
      toast.error('Access restricted to Admin and Super Admin roles');
      router.push('/dashboard');
    }
  }, [router]);

  const loadAgencies = useCallback(async (targetPage = page, targetLimit = limit, targetSearch = search, targetType = selectedType) => {
    try {
      setIsLoading(true);
      const query = {
        page: targetPage,
        limit: targetLimit,
      };
      if (targetSearch && targetSearch.trim()) {
        query.search = targetSearch.trim();
      }
      if (targetType && targetType !== 'ALL') {
        query.type = targetType;
      }

      const res = await agencyAPI.list(query);
      if (res && res.data) {
        const agencyList = Array.isArray(res.data) ? res.data : (res.data.agencies || []);
        setAgencies(agencyList);

        if (res.pagination) {
          setTotalItems(res.pagination.total ?? agencyList.length);
          setTotalPages(res.pagination.totalPages ?? Math.max(1, Math.ceil((res.pagination.total || agencyList.length) / targetLimit)));
        } else {
          setTotalItems(agencyList.length);
          setTotalPages(Math.max(1, Math.ceil(agencyList.length / targetLimit)));
        }
      }
    } catch (err) {
      console.error('Failed to load agencies', err);
      toast.error('Failed to load agencies and correspondence');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (isFirstMount.current) return;
    const timer = setTimeout(() => {
      setPage(1);
      loadAgencies(1, limit, search, selectedType);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, limit, selectedType, loadAgencies]);

  // Page / Limit / Type change effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadAgencies(1, limit, search, selectedType);
      return;
    }
    loadAgencies(page, limit, search, selectedType);
  }, [page, limit, selectedType, loadAgencies]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReload = () => {
    loadAgencies(page, limit, search, selectedType);
  };

  const handleOpenFormModal = (agency = null) => {
    if (agency) {
      setEditingAgency(agency);
      setFormData({
        name: agency.name || '',
        type: agency.type || 'Repair & Maintenance',
        contact: agency.contact || '',
        email: agency.email || '',
        address: agency.address || '',
      });
    } else {
      setEditingAgency(null);
      setFormData({
        name: '',
        type: 'Repair & Maintenance',
        contact: '',
        email: '',
        address: '',
      });
    }
    setIsFormModalOpen(true);
  };

  const handleOpenDocsModal = (agency) => {
    setSelectedAgencyForDocs(agency);
    setIsDocsModalOpen(true);
  };

  const handleSaveAgency = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast.error('Agency name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAgency) {
        await agencyAPI.update(editingAgency.id, formData);
        toast.success('Agency updated successfully');
      } else {
        await agencyAPI.create(formData);
        toast.success('Agency created successfully');
      }
      setIsFormModalOpen(false);
      loadAgencies(page, limit, search, selectedType);
    } catch (err) {
      toast.error(err.message || 'Failed to save agency');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgency) return;
    try {
      setIsSubmitting(true);
      await agencyAPI.delete(deletingAgency.id);
      toast.success('Agency deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingAgency(null);
      loadAgencies(page, limit, search, selectedType);
    } catch (err) {
      toast.error(err.message || 'Failed to delete agency');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats computation
  const totalUploadedDocs = agencies.reduce((acc, curr) => acc + (curr._count?.uploads || 0), 0);

  const columns = [
    {
      header: 'Agency / Partner Name',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '14px' }}>
            {row.name}
          </div>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              fontWeight: 700,
              display: 'inline-block',
              marginTop: '4px'
            }}
          >
            {row.type || 'Repair & Maintenance'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact Information',
      cell: (row) => (
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {row.contact ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-700)' }}>
              <Phone size={13} style={{ color: 'var(--primary-600)' }} />
              <span>{row.contact}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--gray-400)' }}>No phone</span>
          )}
          {row.email ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-600)', fontSize: '12px' }}>
              <Mail size={12} style={{ color: 'var(--primary-600)' }} />
              <span>{row.email}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Location / Address',
      cell: (row) => (
        <div style={{ fontSize: '13px', color: 'var(--gray-600)', maxWidth: '240px' }}>
          {row.address ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <MapPin size={13} style={{ color: 'var(--gray-400)', marginTop: '3px', flexShrink: 0 }} />
              <span>{row.address}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--gray-400)' }}>—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Correspondence Documents',
      cell: (row) => {
        const uploadCount = row._count?.uploads || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: uploadCount > 0 ? '#ecfdf5' : 'var(--gray-100)',
                color: uploadCount > 0 ? '#047857' : 'var(--gray-600)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Paperclip size={13} />
              {uploadCount} {uploadCount === 1 ? 'Document' : 'Documents'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={FileSignature}
            onClick={() => handleOpenDocsModal(row)}
            title="Manage Correspondence Files & Work Orders"
            style={{
              color: 'var(--primary-700)',
              backgroundColor: 'var(--primary-50)',
              fontWeight: 600
            }}
          >
            Correspondence ({row._count?.uploads || 0})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Edit2}
            onClick={() => handleOpenFormModal(row)}
            title="Edit Agency"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => {
              setDeletingAgency(row);
              setIsDeleteModalOpen(true);
            }}
            title="Delete Agency"
            style={{ color: '#ef4444' }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Agency Correspondence & Partners"
      subtitle="Manage repair & maintenance partners along with official correspondence, work orders, inspection certificates, and agreements."
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReload} title="Refresh Agencies">
            Refresh
          </Button>
          <Button variant="accent" icon={Plus} onClick={() => handleOpenFormModal()}>
            Add Agency / Partner
          </Button>
        </div>
      }
    >
      {/* Top Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Agencies / Partners
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {totalItems}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSignature size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Attached Correspondence
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {totalUploadedDocs} Files
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wrench size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Service Categories
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {AGENCY_TYPES.length} Types
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1 1 300px', flexWrap: 'wrap' }}>
            <SearchInput
              placeholder="Search by agency name, contact, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              maxWidth="360px"
            />

            <div style={{ minWidth: '180px' }}>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Agency Types' },
                  ...AGENCY_TYPES.map(t => ({ value: t, label: t }))
                ]}
              />
            </div>
          </div>

          {totalItems > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>
              Showing {agencies.length} of {totalItems.toLocaleString()} agencies
            </span>
          )}
        </div>

        <Table
          columns={columns}
          data={agencies}
          isLoading={isLoading}
          emptyMessage={
            search || selectedType !== 'ALL'
              ? `No agencies matching current filters.`
              : 'No correspondence partners registered yet. Click "Add Agency / Partner" to begin.'
          }
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={isLoading}
          itemName="agencies"
        />
      </Card>

      {/* Add / Edit Agency Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingAgency ? 'Edit Agency / Partner' : 'Add New Agency / Partner'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveAgency} loading={isSubmitting}>
              {editingAgency ? 'Update Agency' : 'Create Agency'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Agency / Firm Name *"
            placeholder="e.g. M/S Standard Electrotech Services"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            required
          />

          <Select
            label="Partner / Service Type"
            value={formData.type}
            onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
            options={AGENCY_TYPES.map(t => ({ value: t, label: t }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Contact Number"
              placeholder="e.g. +91 9876543210"
              value={formData.contact}
              onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. contact@agency.com"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <Input
            label="Workshop / Office Address"
            placeholder="e.g. Plot No 12, MIDC Industrial Area, Dondaicha"
            value={formData.address}
            onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAgency(null);
        }}
        title="Confirm Agency Deletion"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleConfirmDelete} loading={isSubmitting}>
              Delete Agency
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-700)' }}>
            Are you sure you want to delete <strong>{deletingAgency?.name}</strong>?
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)' }}>
            This will archive the agency record and all associated correspondence files.
          </p>
        </div>
      </Modal>

      {/* Correspondence Documents Modal */}
      {selectedAgencyForDocs && (
        <CorrespondenceModal
          agency={selectedAgencyForDocs}
          isOpen={isDocsModalOpen}
          onClose={() => {
            setIsDocsModalOpen(false);
            setSelectedAgencyForDocs(null);
          }}
          onUpdated={() => loadAgencies(page, limit, search, selectedType)}
        />
      )}
    </PageWrapper>
  );
}
