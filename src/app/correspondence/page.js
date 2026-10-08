'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import AssetOutwardTracker from '@/components/correspondence/AssetOutwardTracker';
import Loader from '@/components/ui/Loader';
import { agencyAPI } from '@/lib/api';
import { getAuthUser, canManageCorrespondence } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Building,
  Building2,
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
  FileText,
  Truck,
  ArrowLeft,
  ArrowRight,
  Tag,
  Hash
} from 'lucide-react';

export const SERVICE_CATEGORIES = [
  {
    id: 'DT_Repairing Agency',
    label: 'DT_Repairing Agency',
    shortName: 'DT Repairing',
    description: 'Transformer repairing, testing, oil filtration, and overhaul agencies',
    icon: Wrench,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af'
  },
  {
    id: 'DT_Replacement Agency',
    label: 'DT_Replacement Agency',
    shortName: 'DT Replacement',
    description: 'Distribution transformer replacement and field installation partners',
    icon: RefreshCw,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    badgeBg: '#d1fae5',
    badgeText: '#065f46'
  },
  {
    id: 'Transportation Agency',
    label: 'Transportation Agency',
    shortName: 'Transportation',
    description: 'Heavy logistics, vehicle fleet, crane, and material transit contractors',
    icon: Truck,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#92400e'
  },
  {
    id: 'Substation Correspondance',
    label: 'Substation Correspondance',
    shortName: 'Substation',
    description: 'Substation maintenance, station equipment orders, and official letters',
    icon: Building2,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6'
  },
  {
    id: 'Other-1',
    label: 'Other-1',
    shortName: 'Other-1',
    description: 'General correspondence, utility vendors, and secondary service agencies',
    icon: Layers,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    badgeBg: '#cffafe',
    badgeText: '#155e75'
  },
  {
    id: 'Other -2',
    label: 'Other -2',
    shortName: 'Other-2',
    description: 'Miscellaneous partners, ad-hoc works, and auxiliary correspondence',
    icon: FileText,
    color: '#4b5563',
    bg: '#f9fafb',
    border: '#e5e7eb',
    badgeBg: '#f3f4f6',
    badgeText: '#374151'
  }
];

function CorrespondenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  // Active Category selection
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl && SERVICE_CATEGORIES.some(c => c.id === fromUrl)) {
      return fromUrl;
    }
    return null;
  });

  const [allAgencies, setAllAgencies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    vendor_code: '',
    type: 'DT_Repairing Agency',
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

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && SERVICE_CATEGORIES.some(c => c.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Update URL helper
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setSearch('');
    if (categoryId) {
      router.push(`/correspondence?category=${encodeURIComponent(categoryId)}`, { scroll: false });
    } else {
      router.push('/correspondence', { scroll: false });
    }
  };

  // Load all agencies to compute summary stats
  const loadGlobalStats = useCallback(async () => {
    try {
      const res = await agencyAPI.list({ limit: 1000 });
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.agencies || []);
        setAllAgencies(list);
      }
    } catch (err) {
      console.error('Failed to load global agency stats', err);
    }
  }, []);

  useEffect(() => {
    loadGlobalStats();
  }, [loadGlobalStats]);

  // Load agencies for table
  const loadAgencies = useCallback(async (targetPage = page, targetLimit = limit, targetSearch = search, targetCategory = selectedCategory) => {
    try {
      setIsLoading(true);
      const query = {
        page: targetPage,
        limit: targetLimit,
      };
      if (targetSearch && targetSearch.trim()) {
        query.search = targetSearch.trim();
      }
      if (targetCategory) {
        query.type = targetCategory;
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
  }, [page, limit, search, selectedCategory]);

  // Debounced search effect
  useEffect(() => {
    if (isFirstMount.current) return;
    const timer = setTimeout(() => {
      setPage(1);
      loadAgencies(1, limit, search, selectedCategory);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, limit, selectedCategory, loadAgencies]);

  // Page / Limit / Category change effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadAgencies(1, limit, search, selectedCategory);
      return;
    }
    loadAgencies(page, limit, search, selectedCategory);
  }, [page, limit, selectedCategory, loadAgencies]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReload = () => {
    loadAgencies(page, limit, search, selectedCategory);
    loadGlobalStats();
  };

  const handleOpenFormModal = (agency = null) => {
    if (agency) {
      setEditingAgency(agency);
      setFormData({
        name: agency.name || '',
        vendor_code: agency.vendor_code || '',
        type: agency.type || selectedCategory || 'DT_Repairing Agency',
        contact: agency.contact || '',
        email: agency.email || '',
        address: agency.address || '',
      });
    } else {
      setEditingAgency(null);
      setFormData({
        name: '',
        vendor_code: '',
        type: selectedCategory || 'DT_Repairing Agency',
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
      loadAgencies(page, limit, search, selectedCategory);
      loadGlobalStats();
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
      loadAgencies(page, limit, search, selectedCategory);
      loadGlobalStats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete agency');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats computation per category
  const getCategoryStats = (catId) => {
    const list = allAgencies.filter(a => (a.type || '').trim().toLowerCase() === catId.trim().toLowerCase());
    const docCount = list.reduce((acc, curr) => acc + (curr._count?.uploads || 0), 0);
    return {
      agencyCount: list.length,
      docCount
    };
  };

  const totalGlobalDocs = allAgencies.reduce((acc, curr) => acc + (curr._count?.uploads || 0), 0);

  const activeCategoryObj = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);

  const columns = [
    {
      header: 'Agency / Firm Name',
      cell: (row) => {
        const catConfig = SERVICE_CATEGORIES.find(c => c.id === row.type);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '14px' }}>
                {row.name}
              </span>
              {row.vendor_code && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Vendor Code"
                >
                  <Hash size={11} /> {row.vendor_code}
                </span>
              )}
            </div>
            {!selectedCategory && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: catConfig?.badgeBg || 'var(--primary-100)',
                  color: catConfig?.badgeText || 'var(--primary-800)',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginTop: '4px'
                }}
              >
                {row.type || 'DT_Repairing Agency'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Vendor Code',
      cell: (row) => (
        <div>
          {row.vendor_code ? (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e3a8a',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Tag size={12} style={{ color: '#2563eb' }} />
              {row.vendor_code}
            </span>
          ) : (
            <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>—</span>
          )}
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
        <div style={{ fontSize: '13px', color: 'var(--gray-600)', maxWidth: '220px' }}>
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
      title={selectedCategory ? `${activeCategoryObj?.label || selectedCategory}` : 'Agency Correspondence & Service Categories'}
      subtitle={
        selectedCategory
          ? (activeCategoryObj?.description || 'Manage registered agencies and correspondence documents under this category.')
          : 'Select a service category to manage registered agencies, work orders, test certificates, and official correspondence.'
      }
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedCategory && (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => handleSelectCategory(null)}
            >
              All Categories
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReload} title="Refresh Data">
            Refresh
          </Button>
          <Button variant="accent" icon={Plus} onClick={() => handleOpenFormModal()}>
            Add Agency / Partner
          </Button>
        </div>
      }
    >
      {/* Overview Metrics Cards */}
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
                {selectedCategory ? `${activeCategoryObj?.shortName || 'Category'} Agencies` : 'Total Registered Agencies'}
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {selectedCategory ? totalItems : allAgencies.length}
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
                {selectedCategory
                  ? agencies.reduce((acc, curr) => acc + (curr._count?.uploads || 0), 0)
                  : totalGlobalDocs} Files
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
              <Layers size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Service Categories
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                6 Categories
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* If No Category is selected: Show 6 Service Categories Grid */}
      {!selectedCategory ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 4px 0' }}>
              Service Categories
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: 0 }}>
              Select any of the 6 service categories below to view registered agencies, upload correspondence, and manage documents.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {SERVICE_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const stats = getCategoryStats(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--gray-200)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = cat.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  {/* Category Accent Stripe */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      backgroundColor: cat.color
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          backgroundColor: cat.bg,
                          color: cat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${cat.border}`
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: 'var(--gray-400)',
                          letterSpacing: '0.05em'
                        }}
                      >
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px 0' }}>
                      {cat.label}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      {cat.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--gray-100)',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Agencies
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gray-800)' }}>
                          {stats.agencyCount}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Documents
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gray-800)' }}>
                          {stats.docCount}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: cat.color
                      }}
                    >
                      View List <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section-Wise Asset Outward Issue Tracker (Count >= 2) */}
          <AssetOutwardTracker />
        </div>
      ) : (
        /* Selected Category View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Category Switcher Tabs / Breadcrumb Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSelectCategory(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--gray-500)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ArrowLeft size={14} /> Categories
              </button>
              <span style={{ color: 'var(--gray-300)' }}>/</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: activeCategoryObj?.badgeBg || 'var(--primary-100)',
                    color: activeCategoryObj?.badgeText || 'var(--primary-800)',
                    fontWeight: 800,
                    fontSize: '13px'
                  }}
                >
                  {activeCategoryObj?.label || selectedCategory}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>
                  ({totalItems} {totalItems === 1 ? 'agency' : 'agencies'})
                </span>
              </div>
            </div>

            {/* Quick Category Switcher Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: selectedCategory === cat.id ? 700 : 500,
                    border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid var(--gray-200)',
                    backgroundColor: selectedCategory === cat.id ? cat.bg : '#ffffff',
                    color: selectedCategory === cat.id ? cat.color : 'var(--gray-700)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Agencies Table Card */}
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
                  placeholder={`Search ${activeCategoryObj?.shortName || ''} by name, vendor code, phone, address...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  maxWidth="420px"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {totalItems > 0 && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>
                    Showing {agencies.length} of {totalItems.toLocaleString()} agencies
                  </span>
                )}
                <Button variant="accent" size="sm" icon={Plus} onClick={() => handleOpenFormModal()}>
                  Add Agency
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              data={agencies}
              isLoading={isLoading}
              emptyMessage={
                search
                  ? `No agencies found matching "${search}" in ${selectedCategory}.`
                  : `No agencies registered under ${selectedCategory} yet. Click "Add Agency" to register the first partner.`
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
        </div>
      )}

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Vendor Code"
              placeholder="e.g. VEN-10293 or MSEB-042"
              value={formData.vendor_code}
              onChange={(e) => setFormData(p => ({ ...p, vendor_code: e.target.value }))}
            />

            <Select
              label="Service Category *"
              value={formData.type}
              onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
              options={SERVICE_CATEGORIES.map(t => ({ value: t.id, label: t.label }))}
            />
          </div>

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
          onUpdated={() => {
            loadAgencies(page, limit, search, selectedCategory);
            loadGlobalStats();
          }}
        />
      )}
    </PageWrapper>
  );
}

export default function CorrespondencePage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader />
        </div>
      }
    >
      <CorrespondenceContent />
    </Suspense>
  );
}

