'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionAssetsModal from '@/components/sections/SectionAssetsModal';
import { sectionAPI } from '@/lib/api';
import { getAuthUser, canViewSectionData } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import {
  FolderTree,
  Zap,
  RefreshCw,
  Boxes,
  Eye,
  Building2,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function SectionWiseAssetsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSectionForModal, setSelectedSectionForModal] = useState(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);

  // Verify access for Admin & Super Admin
  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);
    if (authUser && !canViewSectionData(authUser)) {
      toast.error('Access restricted to Admin and Super Admin roles');
      router.push('/dashboard');
    }
  }, [router]);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const res = await sectionAPI.list();
      if (res && res.data) {
        setSections(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load sections', err);
      toast.error('Failed to load section data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleOpenAssetsModal = (section) => {
    setSelectedSectionForModal(section);
    setIsAssetsModalOpen(true);
  };

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.parent_name?.toLowerCase().includes(q)
    );
  }, [sections, search]);

  const totalTransformers = useMemo(() => {
    return sections.reduce((acc, curr) => acc + (curr.asset_count || 0), 0);
  }, [sections]);

  const columns = [
    {
      header: 'Section Name',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FolderTree size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '14px' }}>
              {row.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
              MSEB Section Office
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Section Code',
      cell: (row) => (
        row.code ? (
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
            {row.code}
          </span>
        ) : (
          <span style={{ color: 'var(--gray-400)' }}>—</span>
        )
      ),
    },
    {
      header: 'Sub-Division',
      cell: (row) => (
        <div style={{ fontSize: '13px', color: 'var(--gray-700)', fontWeight: 500 }}>
          {row.parent_name || 'Dondaicha Sub-Division'}
        </div>
      ),
    },
    {
      header: 'Assigned Transformers',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} style={{ color: '#d97706' }} />
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gray-900)' }}>
            {(row.asset_count || 0).toLocaleString()} Units
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Button
          size="sm"
          variant="ghost"
          icon={Eye}
          onClick={() => handleOpenAssetsModal(row)}
          title="View Transformer Inventory"
          style={{
            color: 'var(--primary-700)',
            backgroundColor: 'var(--primary-50)',
            fontWeight: 600
          }}
        >
          View Assets ({row.asset_count || 0})
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Section-Wise Asset Data"
      subtitle="Overview of MSEB Section offices and their allocated transformer assets."
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/assets">
            <Button variant="secondary" size="sm" icon={Boxes}>
              All Master Assets
            </Button>
          </Link>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadSections} title="Refresh">
            Refresh
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
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Active Sections
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {sections.length} Sections
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Section Transformers
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {totalTransformers.toLocaleString()} Units
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Avg Transformers / Section
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                {sections.length > 0 ? Math.round(totalTransformers / sections.length).toLocaleString() : 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sections Table List Card */}
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
          <SearchInput
            placeholder="Search section name, code, or sub-division..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            maxWidth="380px"
          />

          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>
            Showing {filteredSections.length} of {sections.length} sections
          </span>
        </div>

        <Table
          columns={columns}
          data={filteredSections}
          isLoading={isLoading}
          emptyMessage={
            search
              ? `No sections matching "${search}".`
              : 'No section offices found.'
          }
        />
      </Card>

      {/* Section Assets Modal */}
      {selectedSectionForModal && (
        <SectionAssetsModal
          section={selectedSectionForModal}
          isOpen={isAssetsModalOpen}
          onClose={() => {
            setIsAssetsModalOpen(false);
            setSelectedSectionForModal(null);
          }}
        />
      )}
    </PageWrapper>
  );
}
