'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import { getGatePasses } from '@/store/gatepassStore';
import { assetAPI } from '@/lib/api';
import { INITIAL_GATEPASSES } from '@/lib/seedData';
import {
  Wrench,
  Layers,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Hash,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function AssetOutwardTracker() {
  const [gatePasses, setGatePasses] = useState([]);
  const [serverFrequentAssets, setServerFrequentAssets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedAssetForModal, setSelectedAssetForModal] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Load Outward Gatepasses & Server Frequent Outward Assets
  const loadData = async () => {
    try {
      setIsLoading(true);
      // Try backend endpoint first
      try {
        const res = await assetAPI.getFrequentOutward(2);
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setServerFrequentAssets(res.data);
        } else {
          setServerFrequentAssets(null);
        }
      } catch {
        setServerFrequentAssets(null);
      }

      const data = await getGatePasses({ type: 'outward', all: true });
      const passList = Array.isArray(data) ? data : [];
      setGatePasses(passList);
    } catch (err) {
      console.error('Failed to load outward gatepasses for asset tracking:', err);
      setGatePasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process outward gate passes to compute section-wise asset issue counts
  const { processedAssets, availableSections, totalPassesCount, totalFrequentAssetsCount } = useMemo(() => {
    if (Array.isArray(serverFrequentAssets) && serverFrequentAssets.length > 0) {
      const sectionSet = new Set();
      let totalPasses = 0;
      serverFrequentAssets.forEach(a => {
        Object.keys(a.sectionCounts || {}).forEach(sec => sectionSet.add(sec));
        totalPasses += a.totalOutwardCount || 0;
      });
      return {
        processedAssets: serverFrequentAssets,
        availableSections: Array.from(sectionSet).sort(),
        totalPassesCount: totalPasses,
        totalFrequentAssetsCount: serverFrequentAssets.length
      };
    }

    // We filter for outward gate passes only
    let outwardPasses = gatePasses.filter(
      p => (p.type || '').toLowerCase() === 'outward' || (p.gatePassType || '').toLowerCase() === 'outward'
    );

    // Fallback to demo seed data if local database returns 0 gatepasses
    if (outwardPasses.length === 0) {
      outwardPasses = INITIAL_GATEPASSES.filter(p => (p.type || '').toLowerCase() === 'outward');
    }

    const assetMap = {};
    const sectionSet = new Set();

    outwardPasses.forEach(pass => {
      const sectionName =
        pass.destination_section ||
        pass.from_office?.name ||
        pass.to_office?.name ||
        pass.destination_substation ||
        'General Section';

      if (sectionName && sectionName !== 'N/A') {
        sectionSet.add(sectionName);
      }

      const materials = Array.isArray(pass.materials) && pass.materials.length > 0
        ? pass.materials
        : [
            {
              item_type: pass.item_type || 'Transformer',
              make: pass.make || 'MSEB Standard',
              serial_number: pass.serial_number || pass.asset_code || 'N/A',
              capacity: pass.capacity || 'N/A',
              dtc_number: pass.dtc_number || 'N/A',
              village_name: pass.village_name || ''
            }
          ];

      materials.forEach(mat => {
        const serialNo = (mat.serial_number || mat.asset?.serial_number || mat.asset?.asset_code || mat.asset_code || '').trim();
        const make = (mat.make || mat.asset?.make || 'Standard').trim();
        const capacity = (mat.capacity || mat.asset?.capacity || 'N/A').trim();

        if (!serialNo || serialNo === 'N/A') return;

        // Unique key for asset: combine make and serial_number or serial_number alone
        const assetKey = `${make}__${serialNo}`.toLowerCase();

        if (!assetMap[assetKey]) {
          assetMap[assetKey] = {
            id: assetKey,
            serial_number: serialNo,
            make: mat.make || mat.asset?.make || 'MSEB Standard',
            capacity: mat.capacity || mat.asset?.capacity || 'N/A',
            item_type: mat.item_type || mat.asset?.type || 'Transformer',
            dtc_number: mat.dtc_number || mat.asset?.dtc_number || 'N/A',
            village_name: mat.village_name || mat.asset?.village_name || 'N/A',
            totalOutwardCount: 0,
            sectionCounts: {},
            passes: [],
            latestDate: pass.date || pass.created_at,
            latestStatus: pass.status || 'delivered'
          };
        }

        const asset = assetMap[assetKey];
        asset.totalOutwardCount += 1;
        asset.sectionCounts[sectionName] = (asset.sectionCounts[sectionName] || 0) + 1;

        // Track pass entry details
        asset.passes.push({
          pass_id: pass.id || pass.display_id,
          display_id: pass.display_id || pass.id,
          date: pass.date || pass.created_at,
          section: sectionName,
          substation: pass.destination_substation || 'N/A',
          status: pass.status || 'issued',
          recipient: pass.recipient_name || pass.line_staff_name || 'N/A',
          driver: pass.driver_name || 'N/A',
          vehicle: pass.vehicle_number || 'N/A',
          condition: mat.condition || 'good',
          remarks: mat.remarks || pass.remarks || ''
        });

        // Update latest date if current pass date is newer
        const currentPassDate = new Date(pass.date || pass.created_at);
        const latestPassDate = new Date(asset.latestDate);
        if (currentPassDate >= latestPassDate) {
          asset.latestDate = pass.date || pass.created_at;
          asset.latestStatus = pass.status || 'issued';
        }
      });
    });

    if (Array.isArray(serverFrequentAssets) && serverFrequentAssets.length > 0) {
      const sectionSet = new Set();
      let totalPasses = 0;
      serverFrequentAssets.forEach(a => {
        Object.keys(a.sectionCounts || {}).forEach(sec => sectionSet.add(sec));
        totalPasses += a.totalOutwardCount || 0;
      });
      return {
        processedAssets: serverFrequentAssets,
        availableSections: Array.from(sectionSet).sort(),
        totalPassesCount: totalPasses,
        totalFrequentAssetsCount: serverFrequentAssets.length
      };
    }

    // Convert map to list and filter for count >= 2
    const allAssetList = Object.values(assetMap);

    // CONDITION: Only assets with outward count >= 2
    const frequentAssets = allAssetList.filter(asset => asset.totalOutwardCount >= 2);

    // Sort by outward count descending
    frequentAssets.sort((a, b) => b.totalOutwardCount - a.totalOutwardCount);

    return {
      processedAssets: frequentAssets,
      availableSections: Array.from(sectionSet).sort(),
      totalPassesCount: outwardPasses.length,
      totalFrequentAssetsCount: frequentAssets.length
    };
  }, [gatePasses, serverFrequentAssets]);

  // Filtered Assets based on Section & Search Query
  const filteredAssets = useMemo(() => {
    return processedAssets.filter(asset => {
      // Section filter
      if (selectedSection !== 'ALL') {
        if (!asset.sectionCounts[selectedSection]) {
          return false;
        }
      }

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSerial = asset.serial_number.toLowerCase().includes(q);
        const matchesMake = asset.make.toLowerCase().includes(q);
        const matchesCapacity = asset.capacity.toLowerCase().includes(q);
        const matchesDtc = asset.dtc_number.toLowerCase().includes(q);
        const matchesSection = Object.keys(asset.sectionCounts).some(s => s.toLowerCase().includes(q));
        const matchesPassId = asset.passes.some(p => (p.display_id || '').toLowerCase().includes(q));
        return matchesSerial || matchesMake || matchesCapacity || matchesDtc || matchesSection || matchesPassId;
      }

      return true;
    });
  }, [processedAssets, selectedSection, searchQuery]);

  const handleOpenHistoryModal = (asset) => {
    setSelectedAssetForModal(asset);
    setIsHistoryModalOpen(true);
  };

  // Table Columns Setup
  const columns = [
    {
      header: 'Asset & Identification',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--gray-900)',
                backgroundColor: 'var(--gray-100)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--gray-200)',
                fontFamily: 'monospace',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Hash size={12} style={{ color: 'var(--primary-600)' }} />
              {row.serial_number}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1e40af',
                backgroundColor: '#dbeafe',
                padding: '2px 7px',
                borderRadius: '9999px'
              }}
            >
              {row.item_type}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gray-600)', fontWeight: 600 }}>
            {row.make} • <span style={{ color: 'var(--primary-700)' }}>{row.capacity}</span>
          </div>
        </div>
      )
    },
    {
      header: 'DTC / Village Info',
      cell: (row) => (
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--gray-800)' }}>
            <MapPin size={13} style={{ color: '#059669', flexShrink: 0 }} />
            <span>DTC #{row.dtc_number || 'N/A'}</span>
          </div>
          {row.village_name && row.village_name !== 'N/A' && (
            <span style={{ fontSize: '11px', color: 'var(--gray-500)', paddingLeft: '19px' }}>
              Village: {row.village_name}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Section Breakdown',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '260px' }}>
          {Object.entries(row.sectionCounts).map(([sec, count]) => (
            <span
              key={sec}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: selectedSection === sec ? '#fef3c7' : '#f3f4f6',
                color: selectedSection === sec ? '#92400e' : '#374151',
                border: selectedSection === sec ? '1px solid #fde68a' : '1px solid #e5e7eb',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{sec}</span>
              <span
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1e3a8a',
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 800
                }}
              >
                {count}x
              </span>
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Outward Issue Count',
      cell: (row) => (
        <div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: row.totalOutwardCount >= 3 ? '#fef2f2' : '#eff6ff',
              color: row.totalOutwardCount >= 3 ? '#dc2626' : '#2563eb',
              border: row.totalOutwardCount >= 3 ? '1px solid #fecaca' : '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <TrendingUp size={14} />
            {row.totalOutwardCount} Outward Gatepasses
          </span>
        </div>
      )
    },
    {
      header: 'Latest Issue Date',
      cell: (row) => (
        <div style={{ fontSize: '12px', color: 'var(--gray-700)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <Calendar size={13} style={{ color: 'var(--gray-400)' }} />
            <span>{row.latestDate ? new Date(row.latestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
            Pass: {row.passes[row.passes.length - 1]?.display_id || 'N/A'}
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      cell: (row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={Eye}
          onClick={() => handleOpenHistoryModal(row)}
          title="View section-wise outward gate pass history"
        >
          GatePass History ({row.passes.length})
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '2px solid var(--gray-200)',
          paddingBottom: '0.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}
            >
              <Wrench size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                Asset Outward Issue Frequency Tracker (Section-Wise)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0 0' }}>
                Showing transformers and assets issued via Outward Gatepass <strong>2 or more times (Count ≥ 2)</strong> grouped by section.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontWeight: 700,
              border: '1px solid #fde68a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={14} /> Filter Applied: Count ≥ 2 Outward Passes
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            title="Refresh asset outward data"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <Card style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wrench size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Frequent Assets (Count ≥ 2)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)' }}>
                {totalFrequentAssetsCount} Assets
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Total Outward Passes Checked
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)' }}>
                {totalPassesCount} Gatepasses
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Active Sections
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)' }}>
                {availableSections.length} Sections
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Controls Bar: Section Filter Pills + Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Section Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: '1 1 400px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', marginRight: '4px' }}>
              Filter by Section:
            </span>
            <button
              onClick={() => setSelectedSection('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: selectedSection === 'ALL' ? 700 : 500,
                backgroundColor: selectedSection === 'ALL' ? 'var(--primary-600)' : '#ffffff',
                color: selectedSection === 'ALL' ? '#ffffff' : 'var(--gray-700)',
                border: selectedSection === 'ALL' ? '1px solid var(--primary-600)' : '1px solid var(--gray-300)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Sections ({processedAssets.length})
            </button>
            {availableSections.map(sec => {
              const secCount = processedAssets.filter(a => a.sectionCounts[sec]).length;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: selectedSection === sec ? 700 : 500,
                    backgroundColor: selectedSection === sec ? '#1e3a8a' : '#ffffff',
                    color: selectedSection === sec ? '#ffffff' : 'var(--gray-700)',
                    border: selectedSection === sec ? '1px solid #1e3a8a' : '1px solid var(--gray-300)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{sec}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      backgroundColor: selectedSection === sec ? '#ffffff' : 'var(--gray-200)',
                      color: selectedSection === sec ? '#1e3a8a' : 'var(--gray-700)',
                      fontWeight: 800
                    }}
                  >
                    {secCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <SearchInput
            placeholder="Search by serial no, make, capacity, DTC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            maxWidth="320px"
          />
        </div>

        {/* Assets Table */}
        <Table
          columns={columns}
          data={filteredAssets}
          isLoading={isLoading}
          emptyMessage={
            searchQuery
              ? `No assets found matching "${searchQuery}" with outward gatepass count ≥ 2.`
              : selectedSection !== 'ALL'
              ? `No assets issued 2 or more times in ${selectedSection}.`
              : 'No assets found with outward gatepass count ≥ 2.'
          }
        />
      </Card>

      {/* Outward History Modal */}
      {selectedAssetForModal && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedAssetForModal(null);
          }}
          title={`Outward GatePass History - ${selectedAssetForModal.make} (Sr #${selectedAssetForModal.serial_number})`}
          maxWidth="750px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Asset Summary Banner */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a' }}>
                  {selectedAssetForModal.item_type} - {selectedAssetForModal.make} ({selectedAssetForModal.capacity})
                </div>
                <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '2px' }}>
                  Serial Number: <strong>{selectedAssetForModal.serial_number}</strong> • DTC Number: <strong>{selectedAssetForModal.dtc_number}</strong>
                </div>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ⚡ Issued {selectedAssetForModal.totalOutwardCount} Times Outward
              </div>
            </div>

            {/* List of Outward Gate Passes */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '10px' }}>
                All Outward Gate Passes Created for this Asset:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedAssetForModal.passes.map((pass, index) => (
                  <div
                    key={pass.display_id + '_' + index}
                    style={{
                      border: '1px solid var(--gray-200)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-700)' }}>
                          {pass.display_id}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a'
                          }}
                        >
                          Section: {pass.section}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {new Date(pass.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--gray-700)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                      <div><strong>Substation:</strong> {pass.substation}</div>
                      <div><strong>Recipient:</strong> {pass.recipient}</div>
                      <div><strong>Vehicle / Driver:</strong> {pass.vehicle} ({pass.driver})</div>
                      <div><strong>Condition:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{pass.condition}</span></div>
                    </div>

                    {pass.remarks && (
                      <div style={{ fontSize: '11px', color: 'var(--gray-600)', backgroundColor: 'var(--gray-50)', padding: '6px 10px', borderRadius: '4px', fontStyle: 'italic' }}>
                        Remarks: {pass.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
