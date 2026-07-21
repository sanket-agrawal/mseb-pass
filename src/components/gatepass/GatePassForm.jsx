'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useDrivers } from '@/hooks/useDrivers';
import { TRANSFORMER_CAPACITY } from '@/lib/constants';
import { Plus, Trash2, Save, Send, ArrowLeft, Truck, Zap, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const DEFAULT_MARATHI_REMARKS = 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.';

export default function GatePassForm({ initialData = null, isEditMode = false, onSubmit }) {
  const router = useRouter();
  const { drivers, substations } = useDrivers();

  const [formData, setFormData] = useState({
    type: initialData?.type || 'outward',
    status: initialData?.status || 'issued',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    recipient_name: initialData?.recipient_name || 'Assistant Engineer',
    recipient_designation: initialData?.recipient_designation || 'AE',
    destination_section: initialData?.destination_section || 'Virdel Section',
    destination_substation: initialData?.destination_substation || 'Shindkheda S/dn',
    destination_division: initialData?.destination_division || 'Dhule',
    driver_id: initialData?.driver_id || '',
    driver_name: initialData?.driver_name || '',
    driver_mobile: initialData?.driver_mobile || '',
    vehicle_number: initialData?.vehicle_number || '',
    contractor_name: initialData?.contractor_name || 'M/S Standard Electrotech Service',
    materials: initialData?.materials && initialData.materials.length > 0 ? initialData.materials : [
      {
        sr_no: 1,
        item_type: 'Transformer',
        make: '',
        serial_number: '',
        job_number: '',
        capacity: '63 KVA',
        village_name: '',
        group_number: 'Gao',
        dtc_number: '',
        condition: initialData?.type === 'inward' ? 'faulty' : 'new',
        remarks: ''
      }
    ],
    line_staff_name: initialData?.line_staff_name || '',
    line_staff_mobile: initialData?.line_staff_mobile || '',
    line_staff_cpf: initialData?.line_staff_cpf || '',
    sender_name: initialData?.sender_name || 'Sub Divisional Officer',
    sender_designation: initialData?.sender_designation || 'SDO Dondaicha',
    receiver_name: initialData?.receiver_name || '',
    receiver_designation: initialData?.receiver_designation || '',
    remarks: initialData?.remarks || DEFAULT_MARATHI_REMARKS,
    linked_gatepass_id: initialData?.linked_gatepass_id || null
  });

  const [errors, setErrors] = useState({});

  // Auto-fill driver details when driver is selected
  const handleDriverChange = (e) => {
    const drvId = e.target.value;
    const selected = drivers.find(d => d.id === drvId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        driver_id: drvId,
        driver_name: selected.name,
        driver_mobile: selected.mobile,
        vehicle_number: selected.vehicle_number
      }));
    } else {
      setFormData(prev => ({ ...prev, driver_id: drvId }));
    }
  };

  // Auto-fill substation section & division when substation is selected
  const handleSubstationChange = (e) => {
    const subName = e.target.value;
    const selected = substations.find(s => s.name === subName);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        destination_substation: subName,
        destination_section: selected.section,
        destination_division: selected.division,
        line_staff_name: selected.contact_person || prev.line_staff_name,
        line_staff_mobile: selected.contact_mobile || prev.line_staff_mobile
      }));
    } else {
      setFormData(prev => ({ ...prev, destination_substation: subName }));
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setFormData(prev => ({ ...prev, materials: updatedMaterials }));
  };

  const addMaterialRow = () => {
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
          capacity: '63 KVA',
          village_name: '',
          group_number: '',
          dtc_number: '',
          condition: prev.type === 'inward' ? 'faulty' : 'new',
          remarks: ''
        }
      ]
    }));
  };

  const removeMaterialRow = (index) => {
    if (formData.materials.length === 1) {
      toast.error('At least one material item is required');
      return;
    }
    const updated = formData.materials.filter((_, idx) => idx !== index).map((m, idx) => ({ ...m, sr_no: idx + 1 }));
    setFormData(prev => ({ ...prev, materials: updated }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.recipient_name) errs.recipient_name = 'Recipient name is required';
    if (!formData.destination_substation) errs.destination_substation = 'Destination substation is required';
    if (!formData.driver_name) errs.driver_name = 'Driver name is required';
    if (!formData.vehicle_number) errs.vehicle_number = 'Vehicle number is required';
    if (!formData.driver_mobile) errs.driver_mobile = 'Driver mobile is required';

    if (formData.materials.length === 0) {
      errs.materials = 'At least one transformer item must be added';
    } else {
      formData.materials.forEach((m, idx) => {
        if (!m.make) errs[`make_${idx}`] = 'Make is required';
        if (!m.serial_number) errs[`sr_${idx}`] = 'Serial No is required';
        if (!m.capacity) errs[`cap_${idx}`] = 'Capacity is required';
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (actionStatus) => {
    if (!validate()) {
      toast.error('Please fill in all mandatory fields highlighted in red');
      return;
    }

    const payload = {
      ...formData,
      status: actionStatus
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Yellow Paper Header Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--accent-100)',
          border: '2px solid var(--accent-400)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-500)',
              color: 'var(--gray-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            <Zap style={{ width: 26, height: 26, fill: 'currentColor' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gray-900)' }}>
              महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्यादित (MSEDCL)
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-700)', fontWeight: 600 }}>
              उपविभाग दोंडाईचा (Sub Division Dondaicha) - गेट पास / Gate Pass Form
            </p>
          </div>
        </div>

        {/* Outward vs Inward Selector */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#ffffff', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-400)' }}>
          <label
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: formData.type === 'outward' ? 'var(--primary-600)' : 'transparent',
              color: formData.type === 'outward' ? '#ffffff' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <input
              type="radio"
              name="type"
              value="outward"
              checked={formData.type === 'outward'}
              onChange={() => setFormData(prev => ({ ...prev, type: 'outward' }))}
              style={{ display: 'none' }}
            />
            जावक (OUTWARD)
          </label>

          <label
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: formData.type === 'inward' ? 'var(--accent-500)' : 'transparent',
              color: formData.type === 'inward' ? 'var(--gray-900)' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <input
              type="radio"
              name="type"
              value="inward"
              checked={formData.type === 'inward'}
              onChange={() => setFormData(prev => ({ ...prev, type: 'inward' }))}
              style={{ display: 'none' }}
            />
            आवक (INWARD)
          </label>
        </div>
      </div>

      {/* Section 1 & 2: Gate Pass Date & Recipient Details */}
      <Card header="1. Gate Pass Identity & Recipient Details (प्रती)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Input
            label="दिनांक (Date)"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />

          <Input
            label="प्रती (Recipient Name)"
            placeholder="e.g. Assistant Engineer"
            required
            error={errors.recipient_name}
            value={formData.recipient_name}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
          />

          <Input
            label="हुद्दा (Designation)"
            placeholder="e.g. AE / JE"
            value={formData.recipient_designation}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient_designation: e.target.value }))}
          />

          <Select
            label="गंतव्य उपकेंद्र (Destination Substation)"
            required
            error={errors.destination_substation}
            value={formData.destination_substation}
            onChange={handleSubstationChange}
            options={substations.map(s => ({ label: `${s.name} (${s.section})`, value: s.name }))}
          />

          <Input
            label="विभाग / सेक्शन (Section)"
            value={formData.destination_section}
            onChange={(e) => setFormData(prev => ({ ...prev, destination_section: e.target.value }))}
          />

          <Input
            label="मंडल (Division)"
            value={formData.destination_division}
            onChange={(e) => setFormData(prev => ({ ...prev, destination_division: e.target.value }))}
          />
        </div>
      </Card>

      {/* Section 3: Transport & Driver Details */}
      <Card header="2. Transport & Driver Details (गाडी नं. / ठेकेदारास)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Select
            label="चालक निवडा (Select Driver)"
            value={formData.driver_id}
            onChange={handleDriverChange}
            options={drivers.map(d => ({ label: `${d.name} (${d.vehicle_number})`, value: d.id }))}
            placeholder="Choose registered driver..."
          />

          <Input
            label="सामान आणणाऱ्याचे नांव (Driver Name)"
            required
            error={errors.driver_name}
            value={formData.driver_name}
            onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
          />

          <Input
            label="गाडी नं. (Vehicle Number)"
            required
            error={errors.vehicle_number}
            value={formData.vehicle_number}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
          />

          <Input
            label="चालक मोबाईल नं. (Driver Phone)"
            required
            error={errors.driver_mobile}
            value={formData.driver_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, driver_mobile: e.target.value }))}
          />

          <Input
            label="ठेकेदारास (Contractor Name)"
            value={formData.contractor_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contractor_name: e.target.value }))}
          />
        </div>
      </Card>

      {/* Section 4: Dynamic Materials Array */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>3. Material / Transformer Details (मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन)</span>
            <Button variant="outline" size="sm" icon={Plus} onClick={addMaterialRow}>
              Add Item
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {formData.materials.map((mat, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-700)' }}>
                  ITEM #{idx + 1}
                </span>
                {formData.materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <Input
                  label="मेक (Make)"
                  required
                  placeholder="e.g. SVJ, Crompton"
                  error={errors[`make_${idx}`]}
                  value={mat.make}
                  onChange={(e) => handleMaterialChange(idx, 'make', e.target.value)}
                />

                <Input
                  label="सि.नं. (Serial No.)"
                  required
                  placeholder="e.g. 845"
                  error={errors[`sr_${idx}`]}
                  value={mat.serial_number}
                  onChange={(e) => handleMaterialChange(idx, 'serial_number', e.target.value)}
                />

                <Select
                  label="क्षमता (Capacity KVA)"
                  required
                  value={mat.capacity}
                  onChange={(e) => handleMaterialChange(idx, 'capacity', e.target.value)}
                  options={TRANSFORMER_CAPACITY.map(c => ({ label: c, value: c }))}
                />

                <Input
                  label="जॉब नं. (Job No.)"
                  placeholder="e.g. FV-401"
                  value={mat.job_number}
                  onChange={(e) => handleMaterialChange(idx, 'job_number', e.target.value)}
                />

                <Input
                  label="गावाचे नांव (Village Name)"
                  placeholder="e.g. Chaugaon"
                  value={mat.village_name}
                  onChange={(e) => handleMaterialChange(idx, 'village_name', e.target.value)}
                />

                <Input
                  label="DTC नं."
                  placeholder="e.g. 4221318"
                  value={mat.dtc_number}
                  onChange={(e) => handleMaterialChange(idx, 'dtc_number', e.target.value)}
                />

                <Select
                  label="स्थिती (Condition)"
                  value={mat.condition}
                  onChange={(e) => handleMaterialChange(idx, 'condition', e.target.value)}
                  options={[
                    { label: 'नवीन (New)', value: 'new' },
                    { label: 'दुरुस्त (Repaired)', value: 'repaired' },
                    { label: 'दूषित / जळालेले (Faulty)', value: 'faulty' },
                  ]}
                />

                <Input
                  label="शेरा (Remarks)"
                  placeholder="Remarks per item"
                  value={mat.remarks}
                  onChange={(e) => handleMaterialChange(idx, 'remarks', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 5 & 6: Line Staff & Sender Info */}
      <Card header="4. Destination Line Staff & Sender Verification">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Input
            label="लाइन स्टाफ नांव (Destination Staff Name)"
            placeholder="e.g. Rohit Salunkhe"
            value={formData.line_staff_name}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_name: e.target.value }))}
          />

          <Input
            label="लाइन स्टाफ मोबाईल (Staff Phone)"
            value={formData.line_staff_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_mobile: e.target.value }))}
          />

          <Input
            label="CPF / कर्मचारी क्रमांक (CPF No)"
            value={formData.line_staff_cpf}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_cpf: e.target.value }))}
          />

          <Input
            label="देणाऱ्याची सही व नांव (Sender Name)"
            value={formData.sender_name}
            onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
          />

          <Input
            label="देणाऱ्याचा हुद्दा (Sender Designation)"
            value={formData.sender_designation}
            onChange={(e) => setFormData(prev => ({ ...prev, sender_designation: e.target.value }))}
          />
        </div>
      </Card>

      {/* Section 7: General Remarks */}
      <Card header="5. Check & Condition Remarks (शेरा)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
            शेरा (Condition Certificate Template)
          </label>
          <textarea
            rows={3}
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </Card>

      {/* Section 8: Submit Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '0.5rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => router.back()}>
          Cancel
        </Button>

        <Button variant="outline" icon={Save} onClick={() => handleSubmit('draft')}>
          Save as Draft
        </Button>

        <Button variant="accent" icon={Send} onClick={() => handleSubmit('issued')}>
          {isEditMode ? 'Update Gate Pass' : 'Issue Gate Pass (निर्गमित करा)'}
        </Button>
      </div>
    </div>
  );
}
