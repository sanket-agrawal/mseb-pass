import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Button from '@/components/ui/Button';
import { TRANSFORMER_CAPACITY, WARRANTY_STATUS } from '@/lib/constants';
import { assetAPI, contractorAPI, userAPI, officeAPI } from '@/lib/api';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const DEFAULT_MARATHI_REMARKS = 'सदरचे रोहित्र तपासणी अंती योग्य स्थितीत असून LT व HT Rods व्यवस्थित आहेत. कोणतेही Oil Leakage नाही.';

export default function GatePassForm({ initialData = null, linkedPass = null, isEditMode = false, isSubmitting = false, onSubmit }) {
  const router = useRouter();

  const [dtcOptions, setDtcOptions] = useState([]);
  const [cpfOptions, setCpfOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);

  const buildInitialState = (data, linked) => {
    if (linked) {
      return {
        type: 'inward',
        status: 'issued',
        date: new Date().toISOString().split('T')[0],
        from_office_id: linked.to_office_id || '',
        to_office_id: linked.from_office_id || '',
        recipient_name: linked.sender_name || linked.recipient_name || 'Assistant Engineer',
        recipient_designation: linked.sender_designation || linked.recipient_designation || 'AE',
        destination_section: linked.destination_section || '',
        destination_substation: linked.from_office?.name || '',
        destination_division: linked.from_office?.division || linked.destination_division || '',
        vehicle_number: linked.vehicle_number || '',
        driver_name: linked.driver_name || '',
        driver_mobile: linked.driver_mobile || '',
        contractor_id: linked.contractor_id || '',
        contractor_name: linked.contractor_name || linked.contractor?.contractor_firm || linked.contractor?.first_name || '',
        materials: [
          {
            sr_no: 1,
            item_type: 'Transformer',
            make: '',
            serial_number: '',
            job_number: '',
            capacity: '',
            village_name: '',
            group_number: '',
            dtc_number: '',
            condition: 'faulty',
            job_type: 'failed',
            failed_job_record: {
              warranty: 'GP',
              oil_drain_serial_number: '',
              recorded_by_cpf: linked.line_staff_cpf || ''
            },
            healthy_job_record: {
              ryb_r_reading: '100',
              ryb_y_reading: '100',
              ryb_b_reading: '100',
              spark_test: 'ok',
              tested_by_cpf: linked.line_staff_cpf || ''
            },
            remarks: ''
          }
        ],
        line_staff_id: linked.line_staff_id || '',
        line_staff_name: linked.line_staff_name || '',
        line_staff_mobile: linked.line_staff_mobile || '',
        line_staff_cpf: linked.line_staff_cpf || '',
        sender_name: linked.recipient_name || 'Sub Divisional Officer',
        sender_designation: linked.recipient_designation || 'SDO Dondaicha',
        receiver_name: '',
        receiver_designation: '',
        remarks: `Return inward pass for ${linked.display_id || 'outward pass'}`,
        linked_gatepass_id: linked.id
      };
    }

    if (data) {
      return {
        ...data,
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
        materials: (data.materials || []).map((m, idx) => ({
          ...m,
          sr_no: m.sr_no || idx + 1,
          job_type: m.healthy_job_record ? 'healthy' : 'failed',
          failed_job_record: m.failed_job_record || { warranty: 'GP', oil_drain_serial_number: '', recorded_by_cpf: '' },
          healthy_job_record: m.healthy_job_record || { ryb_r_reading: '100', ryb_y_reading: '100', ryb_b_reading: '100', spark_test: 'ok', tested_by_cpf: '' }
        }))
      };
    }

    return {
      type: 'outward',
      status: 'issued',
      date: new Date().toISOString().split('T')[0],
      from_office_id: '',
      to_office_id: '',
      recipient_name: '',
      recipient_designation: 'Assistant Engineer',
      destination_section: '',
      destination_substation: '',
      destination_division: 'Dondaicha Division',
      vehicle_number: '',
      driver_name: '',
      driver_mobile: '',
      contractor_id: '',
      contractor_name: '',
      materials: [
        {
          sr_no: 1,
          item_type: 'Transformer',
          make: '',
          serial_number: '',
          job_number: '',
          capacity: '',
          village_name: '',
          group_number: '',
          dtc_number: '',
          condition: 'repaired',
          job_type: 'healthy',
          failed_job_record: {
            warranty: 'GP',
            oil_drain_serial_number: '',
            recorded_by_cpf: ''
          },
          healthy_job_record: {
            ryb_r_reading: '100',
            ryb_y_reading: '100',
            ryb_b_reading: '100',
            spark_test: 'ok',
            tested_by_cpf: ''
          },
          remarks: ''
        }
      ],
      line_staff_id: '',
      line_staff_name: '',
      line_staff_mobile: '',
      line_staff_cpf: '',
      sender_name: 'Sub Divisional Officer',
      sender_designation: 'SDO Dondaicha',
      sender_cpf: '',
      receiver_name: '',
      receiver_designation: '',
      remarks: DEFAULT_MARATHI_REMARKS,
      linked_gatepass_id: null
    };
  };

  const [formData, setFormData] = useState(() => buildInitialState(initialData, linkedPass));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [assetRes, userRes, contractorRes, officeRes] = await Promise.all([
          assetAPI.list({ limit: 100 }).catch(() => ({ data: [] })),
          userAPI.list({ limit: 100 }).catch(() => ({ data: [] })),
          contractorAPI.list().catch(() => ({ data: [] })),
          officeAPI.list().catch(() => ({ data: [] }))
        ]);

        const assets = assetRes.data || assetRes.assets || [];
        setDtcOptions(
          assets.map(a => ({
            value: a.dtc_number || a.asset_code,
            label: `${a.dtc_number ? `DTC-${a.dtc_number}` : a.asset_code} - ${a.capacity || '—'} (${a.village_name || a.location_substation || ''})`,
            asset: a
          }))
        );

        const users = userRes.data || userRes.users || [];
        setCpfOptions(
          users.filter(u => u.cpf_number).map(u => ({
            value: u.cpf_number,
            label: `${u.cpf_number} - ${u.first_name} ${u.last_name || ''} (${u.designation || 'Staff'})`,
            user: u
          }))
        );

        const contractors = contractorRes.data || contractorRes.contractors || [];
        setContractorOptions(
          contractors.map(c => ({
            value: c.id,
            label: `${c.contractor_firm || c.first_name} (${c.vendor_code || 'Contractor'})`,
            contractor: c
          }))
        );

        const offices = officeRes.data || officeRes.offices || [];
        setOfficeOptions(
          offices.map(o => ({
            value: o.id,
            label: `${o.name} (${o.type})`,
            office: o
          }))
        );
      } catch (err) {
        console.error('Failed to load master data options:', err);
      }
    }
    loadMasterData();
  }, []);

  const handleContractorSelect = (contractorId) => {
    const selected = contractorOptions.find(c => c.value === contractorId);
    setFormData(prev => ({
      ...prev,
      contractor_id: contractorId,
      contractor_name: selected ? (selected.contractor.contractor_firm || selected.contractor.first_name) : ''
    }));
  };

  const handleCPFSelect = (cpf, item) => {
    if (item && item.user) {
      setFormData(prev => ({
        ...prev,
        line_staff_id: item.user.id,
        line_staff_cpf: item.user.cpf_number,
        line_staff_name: `${item.user.first_name} ${item.user.last_name || ''}`.trim(),
        line_staff_mobile: item.user.mobile || prev.line_staff_mobile
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        line_staff_cpf: cpf
      }));
    }
  };

  const handleDestinationOfficeSelect = (officeId) => {
    const selected = officeOptions.find(o => o.value === officeId);
    setFormData(prev => ({
      ...prev,
      to_office_id: officeId,
      destination_substation: selected ? selected.office.name : ''
    }));
  };

  const handleJobRecordCPFSelect = (idx, type, cpf, item) => {
    const field = type === 'healthy' ? 'healthy_job_record' : 'failed_job_record';
    const key = type === 'healthy' ? 'tested_by_cpf' : 'recorded_by_cpf';

    setFormData(prev => {
      const nextMaterials = [...prev.materials];
      nextMaterials[idx] = {
        ...nextMaterials[idx],
        [field]: {
          ...nextMaterials[idx][field],
          [key]: cpf,
          ...(item?.user ? { [`${type === 'healthy' ? 'tested' : 'recorded'}_by_id`]: item.user.id } : {})
        }
      };
      return { ...prev, materials: nextMaterials };
    });
  };

  const handleDTCSelect = async (idx, dtcVal, item) => {
    let asset = item?.asset;
    if (!asset && dtcVal) {
      try {
        const res = await assetAPI.lookupDTC(dtcVal);
        asset = res.data || res.asset;
      } catch (e) {
        // Continue with manual input
      }
    }

    setFormData(prev => {
      const next = [...prev.materials];
      next[idx] = {
        ...next[idx],
        dtc_number: dtcVal,
        ...(asset ? {
          asset_id: asset.id,
          make: asset.make || next[idx].make,
          serial_number: asset.serial_number || next[idx].serial_number,
          capacity: asset.capacity || next[idx].capacity,
          village_name: asset.village_name || next[idx].village_name,
          group_number: asset.group_number || next[idx].group_number
        } : {})
      };
      return { ...prev, materials: next };
    });
  };

  const handleMaterialChange = (idx, field, value) => {
    setFormData(prev => {
      const next = [...prev.materials];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'job_type') {
        next[idx].condition = value === 'healthy' ? 'repaired' : 'faulty';
      }
      return { ...prev, materials: next };
    });
  };

  const handleJobRecordChange = (idx, type, field, value) => {
    const recordKey = type === 'healthy' ? 'healthy_job_record' : 'failed_job_record';
    setFormData(prev => {
      const next = [...prev.materials];
      next[idx] = {
        ...next[idx],
        [recordKey]: {
          ...next[idx][recordKey],
          [field]: value
        }
      };
      return { ...prev, materials: next };
    });
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          sr_no: prev.materials.length + 1,
          item_type: 'Transformer',
          make: '',
          serial_number: '',
          job_number: '',
          capacity: '',
          village_name: '',
          group_number: '',
          dtc_number: '',
          condition: 'repaired',
          job_type: 'healthy',
          failed_job_record: { warranty: 'GP', oil_drain_serial_number: '', recorded_by_cpf: formData.line_staff_cpf || '' },
          healthy_job_record: { ryb_r_reading: '100', ryb_y_reading: '100', ryb_b_reading: '100', spark_test: 'ok', tested_by_cpf: formData.line_staff_cpf || '' },
          remarks: ''
        }
      ]
    }));
  };

  const removeMaterial = (idx) => {
    if (formData.materials.length <= 1) {
      toast.error('Gate pass must have at least one item');
      return;
    }
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== idx).map((m, i) => ({ ...m, sr_no: i + 1 }))
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.recipient_name?.trim()) errs.recipient_name = 'Recipient name is required';
    if (!formData.from_office_id) errs.from_office_id = 'Source office is required';
    if (!formData.to_office_id) errs.to_office_id = 'Destination office is required';

    formData.materials.forEach((m, idx) => {
      if (!m.capacity) errs[`capacity_${idx}`] = 'Capacity is required';

      if (m.job_type === 'failed') {
        if (!m.failed_job_record?.recorded_by_cpf) errs[`recorded_by_cpf_${idx}`] = 'CPF number is required';
      } else if (m.job_type === 'healthy') {
        if (!m.healthy_job_record?.tested_by_cpf) errs[`tested_by_cpf_${idx}`] = 'Tester CPF is required';
        if (!m.healthy_job_record?.ryb_r_reading) errs[`ryb_r_${idx}`] = 'R-Phase reading required';
        if (!m.healthy_job_record?.ryb_y_reading) errs[`ryb_y_${idx}`] = 'Y-Phase reading required';
        if (!m.healthy_job_record?.ryb_b_reading) errs[`ryb_b_${idx}`] = 'B-Phase reading required';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (targetStatus = 'issued') => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const payload = {
      ...formData,
      status: targetStatus,
      materials: formData.materials.map(m => {
        const item = {
          sr_no: m.sr_no,
          asset_id: m.asset_id || null,
          item_type: m.item_type || 'Transformer',
          make: m.make || null,
          serial_number: m.serial_number || null,
          job_number: m.job_number || null,
          capacity: m.capacity || null,
          village_name: m.village_name || null,
          group_number: m.group_number || null,
          dtc_number: m.dtc_number || null,
          condition: m.condition || (m.job_type === 'healthy' ? 'repaired' : 'faulty'),
          remarks: m.remarks || null
        };

        if (m.job_type === 'failed') {
          item.failed_job_record = {
            warranty: m.failed_job_record?.warranty || 'GP',
            oil_drain_serial_number: m.failed_job_record?.oil_drain_serial_number || null,
            recorded_by_cpf: m.failed_job_record?.recorded_by_cpf || formData.line_staff_cpf,
            recorded_by_id: m.failed_job_record?.recorded_by_id || null
          };
        } else if (m.job_type === 'healthy') {
          item.healthy_job_record = {
            ryb_r_reading: String(m.healthy_job_record?.ryb_r_reading || '100'),
            ryb_y_reading: String(m.healthy_job_record?.ryb_y_reading || '100'),
            ryb_b_reading: String(m.healthy_job_record?.ryb_b_reading || '100'),
            spark_test: m.healthy_job_record?.spark_test || 'ok',
            tested_by_cpf: m.healthy_job_record?.tested_by_cpf || formData.line_staff_cpf,
            tested_by_id: m.healthy_job_record?.tested_by_id || null
          };
        }

        return item;
      })
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Section 1: Gate Pass Type & Direction */}
      <Card header="1. Gate Pass Type & Direction">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
              Pass Type <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input
                  type="radio"
                  name="pass_type"
                  value="outward"
                  checked={formData.type === 'outward'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                />
                <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>Outward (जावक)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input
                  type="radio"
                  name="pass_type"
                  value="inward"
                  checked={formData.type === 'inward'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                />
                <span style={{ fontWeight: 600, color: 'var(--amber-700)' }}>Inward (आवक)</span>
              </label>
            </div>
          </div>

          <Input
            label="Issue Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />

          <SearchableSelect
            label="Source Office (कुठून)"
            required
            value={formData.from_office_id}
            onChange={(val) => setFormData(prev => ({ ...prev, from_office_id: val }))}
            options={officeOptions}
            placeholder="Select source office..."
            error={errors.from_office_id}
            allowCustom={false}
          />

          <SearchableSelect
            label="Destination Office (कुठे)"
            required
            value={formData.to_office_id}
            onChange={(val) => handleDestinationOfficeSelect(val)}
            options={officeOptions}
            placeholder="Select destination office..."
            error={errors.to_office_id}
            allowCustom={false}
          />

          <Input
            label="Recipient Official Name"
            required
            placeholder="e.g. Assistant Engineer Dondaicha"
            error={errors.recipient_name}
            value={formData.recipient_name}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
          />
        </div>
      </Card>

      {/* Section 2: Transport & Driver Details */}
      <Card header="2. Transport & Vehicle Details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <Input
            label="Vehicle Number"
            placeholder="e.g. MH-18-BZ-4521"
            value={formData.vehicle_number}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value.toUpperCase() }))}
          />

          <Input
            label="Driver Name"
            placeholder="e.g. Ramesh Patil"
            value={formData.driver_name}
            onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
          />

          <Input
            label="Driver Mobile Number"
            placeholder="e.g. 9876543210"
            value={formData.driver_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, driver_mobile: e.target.value }))}
          />

          <SearchableSelect
            label="Contractor / Transport Agency"
            value={formData.contractor_id}
            onChange={(val) => handleContractorSelect(val)}
            options={contractorOptions}
            placeholder="Select contractor..."
            allowCustom={false}
          />
        </div>
      </Card>

      {/* Section 3: Material Items */}
      <Card
        header="3. Materials / Transformer List"
        action={
          <Button size="sm" variant="outline" icon={Plus} onClick={addMaterial}>
            Add Item
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {formData.materials.map((mat, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg, 8px)',
                padding: '1.25rem',
                backgroundColor: 'var(--gray-50, #f9fafb)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--gray-800)' }}>
                    Item #{idx + 1} - {mat.capacity || 'Transformer'}
                  </span>
                </div>

                {formData.materials.length > 1 && (
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeMaterial(idx)} style={{ color: 'var(--danger-600)' }}>
                    Remove
                  </Button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <SearchableSelect
                  label="DTC Number / Code (रोहित्र क्रमांक)"
                  value={mat.dtc_number}
                  onChange={(val, item) => handleDTCSelect(idx, val, item)}
                  options={dtcOptions}
                  placeholder="Select or enter DTC..."
                  allowCustom={true}
                />

                <Select
                  label="Capacity (क्षमता)"
                  required
                  placeholder="Select capacity..."
                  error={errors[`capacity_${idx}`]}
                  value={mat.capacity}
                  onChange={(e) => handleMaterialChange(idx, 'capacity', e.target.value)}
                  options={TRANSFORMER_CAPACITY.map(c => ({ value: c, label: c }))}
                />

                <Input
                  label="Make / Manufacturer (कंपनी)"
                  placeholder="e.g. Crompton / ABB"
                  value={mat.make}
                  onChange={(e) => handleMaterialChange(idx, 'make', e.target.value)}
                />

                <Input
                  label="Serial Number (अनुक्रमांक)"
                  placeholder="e.g. TR-2024-8921"
                  value={mat.serial_number}
                  onChange={(e) => handleMaterialChange(idx, 'serial_number', e.target.value)}
                />

                <Input
                  label="Job Number (जॉब नं.)"
                  placeholder="e.g. JOB-4412"
                  value={mat.job_number}
                  onChange={(e) => handleMaterialChange(idx, 'job_number', e.target.value)}
                />

                <Input
                  label="Village / DTC Location (गाव / ठिकाण)"
                  placeholder="e.g. Vikharan"
                  value={mat.village_name}
                  onChange={(e) => handleMaterialChange(idx, 'village_name', e.target.value)}
                />
              </div>

              {/* Job Type Toggle: Healthy vs Failed */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-800)' }}>
                    Inspection & Testing Record:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name={`job_type_${idx}`}
                        value="healthy"
                        checked={mat.job_type === 'healthy'}
                        onChange={() => handleMaterialChange(idx, 'job_type', 'healthy')}
                      />
                      <span style={{ color: 'var(--success-700)' }}>Healthy / Repaired (चाचणी अहवाल)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name={`job_type_${idx}`}
                        value="failed"
                        checked={mat.job_type === 'failed'}
                        onChange={() => handleMaterialChange(idx, 'job_type', 'failed')}
                      />
                      <span style={{ color: 'var(--amber-700)' }}>Failed / Faulty (नादुरुस्त)</span>
                    </label>
                  </div>
                </div>

                {/* Sub-form: Failed Job Record */}
                {mat.job_type === 'failed' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    backgroundColor: '#fffbeb',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1px solid #fde68a'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#92400e', marginBottom: '0.375rem' }}>
                        Warranty Status (वॉरंटी)
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          <input
                            type="radio"
                            name={`warranty_${idx}`}
                            value="GP"
                            checked={(mat.failed_job_record?.warranty || 'GP') === 'GP'}
                            onChange={() => handleJobRecordChange(idx, 'failed', 'warranty', 'GP')}
                          />
                          <span style={{ color: '#b45309' }}>GP (Gate Pass Warranty)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          <input
                            type="radio"
                            name={`warranty_${idx}`}
                            value="FRESH"
                            checked={mat.failed_job_record?.warranty === 'FRESH'}
                            onChange={() => handleJobRecordChange(idx, 'failed', 'warranty', 'FRESH')}
                          />
                          <span style={{ color: '#047857' }}>FRESH (Fresh Guarantee)</span>
                        </label>
                      </div>
                    </div>

                    <Input
                      label="Oil Drain Serial Number"
                      placeholder="e.g. OD-9921"
                      value={mat.failed_job_record?.oil_drain_serial_number || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'failed', 'oil_drain_serial_number', e.target.value)}
                    />

                    <SearchableSelect
                      label="Recorded By CPF / Official"
                      required
                      error={errors[`recorded_by_cpf_${idx}`]}
                      value={mat.failed_job_record?.recorded_by_cpf || formData.line_staff_cpf || ''}
                      onChange={(val, item) => handleJobRecordCPFSelect(idx, 'failed', val, item)}
                      options={cpfOptions}
                      placeholder="Search CPF Number..."
                      allowCustom={true}
                    />
                  </div>
                )}

                {/* Sub-form: Healthy Job Record */}
                {mat.job_type === 'healthy' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    backgroundColor: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1px solid #bbf7d0'
                  }}>
                    <SearchableSelect
                      label="Tested By CPF / Official"
                      required
                      error={errors[`tested_by_cpf_${idx}`]}
                      value={mat.healthy_job_record?.tested_by_cpf || formData.line_staff_cpf || ''}
                      onChange={(val, item) => handleJobRecordCPFSelect(idx, 'healthy', val, item)}
                      options={cpfOptions}
                      placeholder="Search CPF Number..."
                      allowCustom={true}
                    />

                    <Input
                      label="R-Phase (Ampere)"
                      required
                      error={errors[`ryb_r_${idx}`]}
                      placeholder="e.g. 100 A"
                      value={mat.healthy_job_record?.ryb_r_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_r_reading', e.target.value)}
                    />

                    <Input
                      label="Y-Phase (Ampere)"
                      required
                      error={errors[`ryb_y_${idx}`]}
                      placeholder="e.g. 100 A"
                      value={mat.healthy_job_record?.ryb_y_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_y_reading', e.target.value)}
                    />

                    <Input
                      label="B-Phase (Ampere)"
                      required
                      error={errors[`ryb_b_${idx}`]}
                      placeholder="e.g. 100 A"
                      value={mat.healthy_job_record?.ryb_b_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_b_reading', e.target.value)}
                    />

                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#166534', marginBottom: '0.375rem' }}>
                        Spark Test Result
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          <input
                            type="radio"
                            name={`spark_test_${idx}`}
                            value="ok"
                            checked={(mat.healthy_job_record?.spark_test || 'ok') === 'ok'}
                            onChange={() => handleJobRecordChange(idx, 'healthy', 'spark_test', 'ok')}
                          />
                          <span style={{ color: 'var(--success-700)' }}>OK (योग्य)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          <input
                            type="radio"
                            name={`spark_test_${idx}`}
                            value="not_ok"
                            checked={mat.healthy_job_record?.spark_test === 'not_ok'}
                            onChange={() => handleJobRecordChange(idx, 'healthy', 'spark_test', 'not_ok')}
                          />
                          <span style={{ color: 'var(--danger-700)' }}>NOT OK (अयोग्य)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 4: Line Staff & Official Details */}
      <Card header="4. Destination Line Staff & Official Details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <SearchableSelect
            label="Line Staff CPF Number"
            value={formData.line_staff_cpf}
            onChange={(val, item) => handleCPFSelect(val, item)}
            options={cpfOptions}
            placeholder="Select or enter Staff CPF..."
            allowCustom={true}
          />

          <Input
            label="Line Staff Name"
            placeholder="e.g. Rohit Salunkhe"
            value={formData.line_staff_name}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_name: e.target.value }))}
          />

          <Input
            label="Line Staff Mobile"
            placeholder="10-digit mobile number"
            value={formData.line_staff_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_mobile: e.target.value }))}
          />

          <Input
            label="Sender Official Name"
            value={formData.sender_name}
            onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
          />

          <Input
            label="Sender Official Designation"
            value={formData.sender_designation}
            onChange={(e) => setFormData(prev => ({ ...prev, sender_designation: e.target.value }))}
          />
        </div>
      </Card>

      {/* Section 5: Remarks */}
      <Card header="5. Condition & Safety Remarks (शेरा)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
            शेरा (Condition Certificate Text)
          </label>
          <textarea
            rows={3}
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md, 6px)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </Card>

      {/* Section 6: Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '0.5rem' }}>
        <Button variant="secondary" icon={ArrowLeft} disabled={isSubmitting} onClick={() => router.back()}>
          Cancel
        </Button>

        <Button variant="accent" loading={isSubmitting} disabled={isSubmitting} onClick={() => handleSubmit('issued')}>
          {isEditMode ? 'Update Gate Pass' : 'Issue Gate Pass (गेटपास निर्गमित करा)'}
        </Button>
      </div>
    </div>
  );
}
