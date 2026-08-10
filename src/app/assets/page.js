'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { assetAPI, officeAPI } from '@/lib/api';
import { getAuthUser, canManageAssets } from '@/lib/auth';
import { Boxes, Plus, Search, Upload, Download, Edit3, ShieldAlert, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

const CAPACITY_OPTIONS = ['15 KVA', '25 KVA', '63 KVA', '100 KVA', '200 KVA', '315 KVA', '500 KVA'];
const CONDITION_OPTIONS = [
  { value: 'good', label: 'Good (सुस्थितीत)' },
  { value: 'faulty', label: 'Faulty / Damaged (दुरुस्तीयोग्य)' },
  { value: 'repaired', label: 'Repaired (दुरुस्त केलेले)' },
  { value: 'scrap', label: 'Scrap (स्क्रॅप/अदुरुस्तीयोग्य)' },
];

export default function AssetsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    serial_number: '',
    make: '',
    capacity_kva: '100 KVA',
    dtc_code: '',
    location_substation: '',
    condition: 'good',
    office_id: '',
  });

  useEffect(() => {
    const authUser = getAuthUser();
    setCurrentUser(authUser);
    if (authUser && !canManageAssets(authUser)) {
      toast.error('Access restricted to Admin or Super Admin role');
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [assetRes, officeRes] = await Promise.all([
        assetAPI.list({ limit: 100 }).catch(() => null),
        officeAPI.list({ limit: 100 }).catch(() => null),
      ]);

      const assetList = assetRes?.data?.assets || assetRes?.data || [];
      setAssets(assetList);

      const officeList = officeRes?.data?.offices || officeRes?.data || [];
      setOffices(officeList);
    } catch (err) {
      toast.error('Failed to load asset directory');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (assetToEdit = null) => {
    if (assetToEdit) {
      setEditingAsset(assetToEdit);
      setFormData({
        serial_number: assetToEdit.serial_number || '',
        make: assetToEdit.make || '',
        capacity_kva: assetToEdit.capacity_kva || '100 KVA',
        dtc_code: assetToEdit.dtc_number || assetToEdit.dtc_code || '',
        dtc_number: assetToEdit.dtc_number || assetToEdit.dtc_code || '',
        location_substation: assetToEdit.location_substation || '',
        condition: assetToEdit.condition || 'good',
        office_id: assetToEdit.office_id || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        serial_number: '',
        make: '',
        capacity_kva: '100 KVA',
        dtc_code: '',
        dtc_number: '',
        location_substation: '',
        condition: 'good',
        office_id: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serial_number || !formData.make) {
      toast.error('Please fill in Serial Number and Make');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        dtc_number: formData.dtc_code || formData.dtc_number,
        dtc_code: formData.dtc_code || formData.dtc_number,
      };
      if (editingAsset) {
        await assetAPI.update(editingAsset.id, payload);
        toast.success('Asset details updated successfully');
      } else {
        await assetAPI.create(payload);
        toast.success('New transformer asset registered');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  // ─── Excel Bulk Upload ──────────────────────────
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Serial_Number: 'TR-2026-9901',
        Make: 'Crompton Greaves',
        Capacity_KVA: '100 KVA',
        DTC_Code: 'DTC-33401',
        Location_Substation: 'Shewade S/stn',
        Condition: 'good',
      },
      {
        Serial_Number: 'TR-2026-9902',
        Make: 'Kirloskar Electric',
        Capacity_KVA: '63 KVA',
        DTC_Code: 'DTC-33402',
        Location_Substation: 'Nardana S/stn',
        Condition: 'faulty',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    XLSX.writeFile(wb, 'mseb_asset_bulk_template.xlsx');
    toast.success('Downloaded Asset Bulk Upload Template');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          toast.error('No data found in uploaded Excel file');
          setImporting(false);
          return;
        }

        const formattedAssets = json.map((row) => ({
          serial_number: String(row.Serial_Number || row.serial_number || ''),
          make: row.Make || row.make || '',
          capacity_kva: row.Capacity_KVA || row.capacity_kva || '100 KVA',
          dtc_code: row.DTC_Code || row.dtc_code || '',
          location_substation: row.Location_Substation || row.location_substation || '',
          condition: (row.Condition || row.condition || 'good').toLowerCase(),
        }));

        toast.loading(`Importing ${formattedAssets.length} transformer assets...`, { id: 'bulk-asset-import-toast' });
        const res = await assetAPI.bulkImport(formattedAssets);

        if (res && res.data) {
          toast.success(`Successfully imported ${res.data.imported_count || formattedAssets.length} assets!`, { id: 'bulk-asset-import-toast' });
        }
        setBulkModalOpen(false);
        loadData();
      } catch (err) {
        toast.error(err?.message || 'Failed to process Excel file', { id: 'bulk-asset-import-toast' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredAssets = assets.filter((a) => {
    const q = search.toLowerCase();
    const sn = (a.serial_number || '').toLowerCase();
    const make = (a.make || '').toLowerCase();
    const dtc = (a.dtc_number || a.dtc_code || '').toLowerCase();
    const sub = (a.location_substation || '').toLowerCase();
    return sn.includes(q) || make.includes(q) || dtc.includes(q) || sub.includes(q);
  });

  const officeOptions = offices.map((o) => ({
    value: o.id,
    label: o.name,
    subtext: `${o.type} • ${o.division || ''}`,
  }));

  const getConditionBadgeStyle = (cond) => {
    switch (cond) {
      case 'good':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid #a7f3d0', label: 'Good' };
      case 'faulty':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', border: '1px solid #fca5a5', label: 'Faulty' };
      case 'repaired':
        return { bg: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', border: '1px solid #c7d2fe', label: 'Repaired' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', color: '#4b5563', border: '1px solid #e5e7eb', label: cond };
    }
  };

  return (
    <PageWrapper
      title="Asset & Transformer Management"
      subtitle="Master Directory of all MSEDCL distribution transformers, DTC codes, capacities, and health conditions."
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={Upload} onClick={() => setBulkModalOpen(true)}>
            Bulk Excel Import
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => handleOpenModal(null)}>
            + Register New Asset
          </Button>
        </div>
      }
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--gray-400)' }} />
          <Input
            placeholder="Search assets by Serial No, Make, DTC Code, or Substation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      <Card header={`Registered Transformer Assets (${filteredAssets.length})`}>
        {loading ? (
          <Loader text="Loading asset directory..." />
        ) : filteredAssets.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
            No assets found matching filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Serial Number</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Make</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Capacity (KVA)</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>DTC Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Substation / Location</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Condition</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => {
                  const badge = getConditionBadgeStyle(a.condition);
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {a.serial_number}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--gray-900)' }}>
                        {a.make}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--gray-700)' }}>
                        {a.capacity_kva || '100 KVA'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--gray-700)', fontWeight: 600 }}>
                        {a.dtc_number || a.dtc_code || '—'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--gray-700)' }}>
                        {a.location_substation || 'Sub Division Store'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm, 4px)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Button size="sm" variant="outline" icon={Edit3} onClick={() => handleOpenModal(a)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Asset Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAsset ? `Edit Transformer Asset: ${editingAsset.serial_number}` : 'Register New Transformer Asset'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input
              label="Transformer Serial Number"
              required
              placeholder="e.g. TR-2026-9901"
              value={formData.serial_number}
              onChange={(e) => setFormData((p) => ({ ...p, serial_number: e.target.value }))}
            />
            <Input
              label="Make (निर्माता कंपनी)"
              required
              placeholder="e.g. Crompton Greaves"
              value={formData.make}
              onChange={(e) => setFormData((p) => ({ ...p, make: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 4, display: 'block' }}>
                Capacity (क्षमता)
              </label>
              <select
                value={formData.capacity_kva}
                onChange={(e) => setFormData((p) => ({ ...p, capacity_kva: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '13px' }}
              >
                {CAPACITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input
              label="DTC Code (DTC कोड)"
              placeholder="e.g. DTC-33401"
              value={formData.dtc_code}
              onChange={(e) => setFormData((p) => ({ ...p, dtc_code: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input
              label="Location / Substation"
              placeholder="e.g. Shewade S/stn"
              value={formData.location_substation}
              onChange={(e) => setFormData((p) => ({ ...p, location_substation: e.target.value }))}
            />
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 4, display: 'block' }}>
                Health Condition (स्थिती)
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData((p) => ({ ...p, condition: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '13px' }}
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <SearchableSelect
            label="Assigned Office / Division Store"
            value={formData.office_id}
            onChange={(val) => setFormData((p) => ({ ...p, office_id: val }))}
            options={officeOptions}
            placeholder="Select office..."
            allowCustom={false}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingAsset ? 'Save Asset Details' : 'Register Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Asset Excel Upload Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Excel Bulk Import Transformer Assets"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            Upload an Excel (.xlsx / .csv) file containing transformer asset records to populate or update your asset directory.
          </p>

          <div style={{ padding: '1rem', border: '1px dashed var(--primary-300)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-900)', marginBottom: '4px' }}>
              📥 Download Sample Asset Excel Template
            </div>
            <div style={{ fontSize: '12px', color: 'var(--primary-700)', marginBottom: '12px' }}>
              Includes required columns: Serial_Number, Make, Capacity_KVA, DTC_Code, Location_Substation, Condition.
            </div>
            <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadTemplate}>
              Download Excel Template
            </Button>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--gray-800)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              📁 Select Excel File to Upload:
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              disabled={importing}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            />
          </div>

          {importing && <Loader text="Processing Excel records & registering assets..." />}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
