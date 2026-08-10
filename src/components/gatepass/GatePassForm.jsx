import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Button from '@/components/ui/Button';
import { useDrivers } from '@/hooks/useDrivers';
import { TRANSFORMER_CAPACITY } from '@/lib/constants';
import { lookupCPF } from '@/lib/auth';
import { assetAPI, contractorAPI, userAPI } from '@/lib/api';
import { Loader2, Plus, Trash2, Save, Send, ArrowLeft, Truck, Zap, User, FileText, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const DEFAULT_MARATHI_REMARKS = 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.';

const DEFAULT_CPF_OPTIONS = [
  { value: '2645050', label: '2645050 - Rohit Salunkhe', subtext: 'Rohit Salunkhe (Line Staff / S/dn Dondaicha) • Mob: 9427166630', data: { cpf_number: '2645050', full_name: 'Rohit Salunkhe', mobile: '9427166630' } },
  { value: '1182741', label: '1182741 - Junior Engineer Nardana', subtext: 'Junior Engineer (Nardana S/stn) • Mob: 9421512345', data: { cpf_number: '1182741', full_name: 'Junior Engineer Nardana', mobile: '9421512345' } },
  { value: '3341920', label: '3341920 - S. K. Mahajan', subtext: 'S. K. Mahajan (Shewade S/stn) • Mob: 9881122334', data: { cpf_number: '3341920', full_name: 'S. K. Mahajan', mobile: '9881122334' } },
  { value: '9764433', label: '9764433 - P. B. Chaudhari', subtext: 'P. B. Chaudhari (Vikhran Section) • Mob: 9764433221', data: { cpf_number: '9764433', full_name: 'P. B. Chaudhari', mobile: '9764433221' } },
  { value: '9420099', label: '9420099 - V. R. Ahire', subtext: 'V. R. Ahire (Bahmne Section) • Mob: 9420099887', data: { cpf_number: '9420099', full_name: 'V. R. Ahire', mobile: '9420099887' } },
];

export default function GatePassForm({ initialData = null, linkedPass = null, isEditMode = false, isSubmitting = false, onSubmit }) {
  const router = useRouter();
  const { drivers, substations } = useDrivers();

  const [dtcOptions, setDtcOptions] = useState([]);
  const [cpfOptions, setCpfOptions] = useState(DEFAULT_CPF_OPTIONS);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);

  const buildInitialState = (data, linked) => {
    if (linked) {
      const isOutward = linked.type === 'outward';
      return {
        type: 'inward',
        status: 'issued',
        date: new Date().toISOString().split('T')[0],
        from_office_id: linked.to_office_id || '',
        to_office_id: linked.from_office_id || '',
        recipient_name: linked.sender_name || linked.recipient_name || 'Assistant Engineer',
        recipient_designation: linked.sender_designation || linked.recipient_designation || 'AE',
        destination_section: linked.destination_section || '',
        destination_substation: linked.destination_substation || linked.from_office?.name || '',
        destination_division: linked.destination_division || '',
        driver_id: linked.driver_id || '',
        driver_name: linked.driver_name || linked.driver?.name || '',
        driver_mobile: linked.driver_mobile || linked.driver?.mobile || '',
        vehicle_number: linked.vehicle_number || linked.driver?.vehicle_number || '',
        contractor_id: linked.contractor_id || '',
        contractor_name: (linked.contractor_name && !linked.contractor_name.startsWith('cnt_') ? linked.contractor_name : (linked.contractor?.company_name || linked.contractor?.contractor_firm || linked.contractor?.name || '')),
        materials: linked.materials && linked.materials.length > 0 ? linked.materials.map(m => ({
          sr_no: m.sr_no,
          item_type: m.item_type || 'Transformer',
          make: m.make || '',
          serial_number: m.serial_number || '',
          job_number: m.job_number || '',
          capacity: m.capacity || '63 KVA',
          village_name: m.village_name || '',
          group_number: m.group_number || '',
          dtc_number: m.dtc_number || '',
          condition: 'faulty',
          job_type: 'failed',
          failed_job_record: {
            gp_reading: '',
            fresh_reading: '',
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
          remarks: m.remarks || ''
        })) : [
          {
            sr_no: 1,
            item_type: 'Transformer',
            make: '',
            serial_number: '',
            job_number: '',
            capacity: '63 KVA',
            village_name: '',
            group_number: '',
            dtc_number: '',
            condition: 'faulty',
            job_type: 'failed',
            failed_job_record: { gp_reading: '', fresh_reading: '', oil_drain_serial_number: '', recorded_by_cpf: '' },
            healthy_job_record: { ryb_r_reading: '100', ryb_y_reading: '100', ryb_b_reading: '100', spark_test: 'ok', tested_by_cpf: '' },
            remarks: ''
          }
        ],
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

    const passType = data?.type || 'outward';
    return {
      type: passType,
      status: data?.status || 'issued',
      date: data?.date || new Date().toISOString().split('T')[0],
      from_office_id: data?.from_office_id || '',
      to_office_id: data?.to_office_id || '',
      recipient_name: data?.recipient_name || 'Assistant Engineer',
      recipient_designation: data?.recipient_designation || 'AE',
      destination_section: data?.destination_section || 'Virdel Section',
      destination_substation: data?.destination_substation || 'Shindkheda S/dn',
      destination_division: data?.destination_division || 'Dhule',
      driver_id: data?.driver_id || '',
      driver_name: data?.driver_name || '',
      driver_mobile: data?.driver_mobile || '',
      vehicle_number: data?.vehicle_number || '',
      contractor_id: data?.contractor_id || '',
      contractor_name: data?.contractor_name || '',
      materials: data?.materials && data.materials.length > 0 ? data.materials.map(m => ({
        ...m,
        job_type: passType === 'inward' ? 'failed' : 'healthy',
        condition: passType === 'inward' ? 'faulty' : (m.condition || 'new'),
        failed_job_record: m.failed_job_record || {
          gp_reading: '',
          fresh_reading: '',
          oil_drain_serial_number: '',
          recorded_by_cpf: data?.line_staff_cpf || ''
        },
        healthy_job_record: m.healthy_job_record || {
          ryb_r_reading: '100',
          ryb_y_reading: '100',
          ryb_b_reading: '100',
          spark_test: 'ok',
          tested_by_cpf: data?.line_staff_cpf || ''
        }
      })) : [
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
          condition: passType === 'inward' ? 'faulty' : 'new',
          job_type: passType === 'inward' ? 'failed' : 'healthy',
          failed_job_record: {
            gp_reading: '',
            fresh_reading: '',
            oil_drain_serial_number: '',
            recorded_by_cpf: data?.line_staff_cpf || ''
          },
          healthy_job_record: {
            ryb_r_reading: '100',
            ryb_y_reading: '100',
            ryb_b_reading: '100',
            spark_test: 'ok',
            tested_by_cpf: data?.line_staff_cpf || ''
          },
          remarks: ''
        }
      ],
      line_staff_name: data?.line_staff_name || '',
      line_staff_mobile: data?.line_staff_mobile || '',
      line_staff_cpf: data?.line_staff_cpf || '',
      sender_name: data?.sender_name || 'Sub Divisional Officer',
      sender_designation: data?.sender_designation || 'SDO Dondaicha',
      receiver_name: data?.receiver_name || '',
      receiver_designation: data?.receiver_designation || '',
      remarks: data?.remarks || DEFAULT_MARATHI_REMARKS,
      linked_gatepass_id: data?.linked_gatepass_id || null
    };
  };

  const [formData, setFormData] = useState(() => buildInitialState(initialData, linkedPass));

  useEffect(() => {
    if (linkedPass) {
      setFormData(buildInitialState(initialData, linkedPass));
    }
  }, [linkedPass]);

  const [errors, setErrors] = useState({});
  const [lookingUpCpf, setLookingUpCpf] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(
    Boolean(initialData?.driver_name || initialData?.vehicle_number || initialData?.driver_id)
  );

  // Load dynamic DTC options from backend API if available
  useEffect(() => {
    async function loadDynamicOptions() {
      try {
        const assetRes = await assetAPI.list({ limit: 100 });
        const assets = assetRes?.data?.assets || assetRes?.data || [];
        if (Array.isArray(assets) && assets.length > 0) {
          const apiDtcOptions = assets
            .filter(a => a.dtc_number || a.dtc_code)
            .map(a => {
              const dtcVal = a.dtc_number || a.dtc_code;
              return {
                value: dtcVal,
                label: `${dtcVal} - ${a.village_name || a.location_office?.name || a.location_substation || 'Asset'}`,
                subtext: `Village: ${a.village_name || 'N/A'} | Cap: ${a.capacity || a.capacity_kva || 'N/A'} | Make: ${a.make || 'N/A'}`,
                data: {
                  dtc_number: dtcVal,
                  make: a.make || '',
                  serial_number: a.serial_number || '',
                  capacity: a.capacity || a.capacity_kva || '',
                  village_name: a.village_name || '',
                  condition: a.condition || 'new'
                }
              };
            });

          setDtcOptions(apiDtcOptions);
        }
        // Load contractors dynamically
        const cntRes = await contractorAPI.list({ limit: 100 });
        const cntList = cntRes?.data?.contractors || cntRes?.data || [];
        if (Array.isArray(cntList) && cntList.length > 0) {
          const apiCntOptions = cntList.map(c => {
            const firmName = c.name || c.company_name || c.contractor_firm || 'Contractor';
            return {
              value: c.id,
              label: firmName,
              subtext: `${c.address || 'MSEDCL Contractor Partner'}`,
              data: { ...c, company_name: firmName, name: firmName }
            };
          });

          setContractorOptions(prev => {
            const combined = [...prev];
            apiCntOptions.forEach(opt => {
              if (!combined.some(c => c.value === opt.value)) combined.push(opt);
            });
            return combined;
          });
        }
        // Load all employees for CPF lookup options
        const empRes = await userAPI.list({ limit: 200 });
        const empList = empRes?.data?.users || empRes?.data || [];
        if (Array.isArray(empList) && empList.length > 0) {
          const vendorList = [];
          const cpfList = [];

          empList.forEach(u => {
            const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
            const cpfNum = (u.cpf_number || '').replace(/^CPF-/, '');

            // Separate vendors for vendor dropdown
            if (u.role === 'vendor') {
              vendorList.push({
                value: u.id,
                label: fullName || u.company_name || 'Vendor',
                subtext: `${u.company_name || ''} | Mob: ${u.mobile || 'N/A'} | CPF: ${cpfNum || 'N/A'}`,
                data: u
              });
            }

            // All non-vendor users go into CPF options
            if (u.role !== 'vendor') {
              cpfList.push({
                value: cpfNum,
                label: `${cpfNum} - ${fullName}`,
                subtext: `${fullName} (${u.designation || u.role || 'Official'}) • Mob: ${u.mobile || 'N/A'}`,
                data: { cpf_number: cpfNum, full_name: fullName, mobile: u.mobile || '' }
              });
            }
          });

          if (vendorList.length > 0) setVendorOptions(vendorList);
          if (cpfList.length > 0) setCpfOptions(cpfList);
        }
      } catch (err) {
        console.log('Dynamic options note:', err?.message);
      }
    }
    loadDynamicOptions();
  }, []);

  // Build office options from substations data for from/to office selectors
  useEffect(() => {
    const subList = Array.isArray(substations) ? substations : [];
    if (subList.length > 0) {
      const opts = subList.map(s => ({
        value: s.id,
        label: s.name,
        subtext: `${s.type || ''} | ${s.division || s.circle || ''}`.replace(/^\s*\|\s*$/, ''),
        data: s
      })).filter(o => o.value);
      setOfficeOptions(opts);

      // Auto-set from_office_id to user's office if not already set
      if (!formData.from_office_id) {
        try {
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('mseb_user') : null;
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user?.office_id) {
              setFormData(prev => ({ ...prev, from_office_id: prev.from_office_id || user.office_id }));
            }
          }
        } catch (_) { /* ignore */ }
      }
    }
  }, [substations]);

  const handleCPFLookup = async (targetCpf) => {
    const cpfToLookup = targetCpf || formData.line_staff_cpf;
    if (!cpfToLookup) {
      toast.error('Please select or enter a CPF / CPR number first');
      return;
    }
    setLookingUpCpf(true);
    try {
      const official = await lookupCPF(cpfToLookup);
      setFormData(prev => ({
        ...prev,
        line_staff_cpf: cpfToLookup,
        line_staff_name: official.full_name || `${official.first_name || ''} ${official.last_name || ''}`.trim() || prev.line_staff_name,
        line_staff_mobile: official.mobile || prev.line_staff_mobile,
      }));
      toast.success(`Found official: ${official.full_name} (${official.designation || 'Official'})`);
    } catch (err) {
      console.log('CPF lookup info:', err?.message);
    } finally {
      setLookingUpCpf(false);
    }
  };

  const handleDTCLookup = async (idx, targetDtc) => {
    const dtc = targetDtc || formData.materials[idx]?.dtc_number;
    if (!dtc) {
      toast.error('Please enter a DTC or Serial Number first');
      return;
    }
    try {
      const asset = await assetAPI.lookupDTC(dtc);
      if (asset) {
        setFormData(prev => {
          const updated = [...prev.materials];
          updated[idx] = {
            ...updated[idx],
            dtc_number: dtc,
            make: asset.make || updated[idx].make,
            serial_number: asset.serial_number || updated[idx].serial_number,
            capacity: asset.capacity || updated[idx].capacity,
            village_name: asset.village_name || updated[idx].village_name,
            condition: asset.condition || updated[idx].condition,
          };
          return { ...prev, materials: updated };
        });
        toast.success(`DTC Found! Auto-filled ${asset.make || ''} ${asset.capacity || ''} (${asset.village_name || ''})`);
      }
    } catch (err) {
      console.log('DTC lookup info:', err?.message);
    }
  };

  const handleDTCSelect = (idx, selectedDtcValue, optionData) => {
    const targetData = optionData?.data || optionData || {};
    setFormData(prev => {
      const updated = [...prev.materials];
      updated[idx] = {
        ...updated[idx],
        dtc_number: selectedDtcValue,
        ...(targetData.make ? { make: targetData.make } : {}),
        ...(targetData.serial_number ? { serial_number: targetData.serial_number } : {}),
        ...(targetData.capacity ? { capacity: targetData.capacity } : {}),
        ...(targetData.village_name ? { village_name: targetData.village_name } : {}),
        ...(targetData.condition ? { condition: targetData.condition } : {}),
      };
      return { ...prev, materials: updated };
    });

    if (targetData.make) {
      toast.success(`DTC ${selectedDtcValue} selected! Auto-filled ${targetData.make || ''} ${targetData.capacity || ''} (${targetData.village_name || ''})`);
    } else if (selectedDtcValue && selectedDtcValue.length >= 3) {
      handleDTCLookup(idx, selectedDtcValue);
    }
  };

  const handleCPFSelect = (selectedCpfValue, optionData) => {
    const targetData = optionData?.data || optionData || {};
    setFormData(prev => ({
      ...prev,
      line_staff_cpf: selectedCpfValue,
      ...(targetData.full_name ? { line_staff_name: targetData.full_name } : {}),
      ...(targetData.mobile ? { line_staff_mobile: targetData.mobile } : {})
    }));

    if (targetData.full_name) {
      toast.success(`Official ${targetData.full_name} selected for CPF/CPR ${selectedCpfValue}!`);
    } else if (selectedCpfValue && selectedCpfValue.length >= 3) {
      handleCPFLookup(selectedCpfValue);
    }
  };

  // Auto-fill driver details when driver is selected from SearchableSelect
  const handleDriverSelect = (selectedDriverId, optionData) => {
    const targetData = optionData?.data || optionData || {};
    if (targetData.id) {
      setFormData(prev => ({
        ...prev,
        driver_id: targetData.id,
        driver_name: targetData.name || prev.driver_name,
        driver_mobile: targetData.mobile || prev.driver_mobile,
        vehicle_number: targetData.vehicle_number || prev.vehicle_number
      }));
      toast.success(`Driver ${targetData.name} selected — vehicle: ${targetData.vehicle_number || 'N/A'}`);
    } else {
      // Custom typed value (unregistered driver name)
      setFormData(prev => ({ ...prev, driver_id: '', driver_name: selectedDriverId }));
    }
  };

  // Handle office selection for from/to
  const handleOfficeSelect = (field, selectedId, optionData) => {
    const targetOffice = optionData?.data || officeOptions.find(o => o.value === selectedId)?.data;
    setFormData(prev => {
      const nextState = { ...prev, [field]: selectedId };
      if (field === 'from_office_id' && targetOffice) {
        const typeStr = (targetOffice.type || targetOffice.office_type || targetOffice.name || '').toLowerCase();
        if (typeStr.includes('division')) {
          nextState.type = 'outward';
          nextState.materials = (nextState.materials || []).map(m => ({
            ...m,
            job_type: 'healthy',
            condition: m.condition === 'faulty' ? 'new' : (m.condition || 'new')
          }));
        }
      }
      return nextState;
    });
  };

  // Auto-fill substation section & division when substation is selected
  const handleSubstationChange = (e) => {
    const subName = e.target.value;
    const subList = Array.isArray(substations) ? substations : [];
    const selected = subList.find(s => s.name === subName);
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

  const handleTypeChange = (newType) => {
    setFormData(prev => {
      const updatedMaterials = prev.materials.map(m => {
        const isFailed = newType === 'inward';
        return {
          ...m,
          condition: isFailed ? 'faulty' : 'new',
          job_type: isFailed ? 'failed' : 'healthy',
          failed_job_record: m.failed_job_record || {
            gp_reading: '',
            fresh_reading: '',
            oil_drain_serial_number: '',
            recorded_by_cpf: prev.line_staff_cpf || ''
          },
          healthy_job_record: m.healthy_job_record || {
            ryb_r_reading: '100',
            ryb_y_reading: '100',
            ryb_b_reading: '100',
            spark_test: 'ok',
            tested_by_cpf: prev.line_staff_cpf || ''
          }
        };
      });
      return {
        ...prev,
        type: newType,
        materials: updatedMaterials
      };
    });
  };

  const handleJobRecordChange = (idx, recordType, field, value) => {
    setFormData(prev => {
      const updated = [...prev.materials];
      const targetRecordKey = recordType === 'failed' ? 'failed_job_record' : 'healthy_job_record';
      updated[idx] = {
        ...updated[idx],
        [targetRecordKey]: {
          ...(updated[idx][targetRecordKey] || {}),
          [field]: value
        }
      };
      return { ...prev, materials: updated };
    });
  };

  const handleJobRecordCPFSelect = (idx, recordType, selectedCpfValue, optionData) => {
    const targetRecordKey = recordType === 'failed' ? 'failed_job_record' : 'healthy_job_record';
    const cpfFieldKey = recordType === 'failed' ? 'recorded_by_cpf' : 'tested_by_cpf';

    setFormData(prev => {
      const updated = [...prev.materials];
      updated[idx] = {
        ...updated[idx],
        [targetRecordKey]: {
          ...(updated[idx][targetRecordKey] || {}),
          [cpfFieldKey]: selectedCpfValue
        }
      };
      return { ...prev, materials: updated };
    });

    const targetData = optionData?.data || optionData || {};
    if (targetData.full_name) {
      toast.success(`Official ${targetData.full_name} selected (${selectedCpfValue})`);
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...formData.materials];
    if (field === 'job_type') {
      const isFailed = value === 'failed';
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        job_type: value,
        condition: isFailed ? 'faulty' : (updatedMaterials[index].condition === 'faulty' ? 'new' : updatedMaterials[index].condition || 'new')
      };
    } else {
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    }
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
          job_type: prev.type === 'inward' ? 'failed' : 'healthy',
          failed_job_record: {
            gp_reading: '',
            fresh_reading: '',
            oil_drain_serial_number: '',
            recorded_by_cpf: prev.line_staff_cpf || ''
          },
          healthy_job_record: {
            ryb_r_reading: '100',
            ryb_y_reading: '100',
            ryb_b_reading: '100',
            spark_test: 'ok',
            tested_by_cpf: prev.line_staff_cpf || ''
          },
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

    // Driver details are optional. Only validate if user opened driver details and entered driver name without vehicle number
    if (showDriverDetails) {
      if (formData.driver_name && !formData.vehicle_number) {
        errs.vehicle_number = 'Vehicle number is required when driver details are provided';
      }
      if (formData.driver_mobile && !/^\d{10}$/.test(formData.driver_mobile.trim())) {
        errs.driver_mobile = 'Driver phone number must be exactly 10 digits';
      }
    }

    if (formData.line_staff_mobile && !/^\d{10}$/.test(formData.line_staff_mobile.trim())) {
      errs.line_staff_mobile = 'Line staff mobile number must be exactly 10 digits';
    }

    if (formData.materials.length === 0) {
      errs.materials = 'At least one transformer item must be added';
    } else {
      formData.materials.forEach((m, idx) => {
        if (!m.make) errs[`make_${idx}`] = 'Make is required';
        if (!m.serial_number) errs[`sr_${idx}`] = 'Serial No is required';
        if (!m.capacity) errs[`cap_${idx}`] = 'Capacity is required';

        const isFailed = (m.job_type === 'failed') || (m.condition === 'faulty');
        if (isFailed) {
          const cpf = m.failed_job_record?.recorded_by_cpf || formData.line_staff_cpf;
          if (!cpf) errs[`recorded_by_cpf_${idx}`] = 'Recording official CPF is required';
          if (!m.failed_job_record?.gp_reading) errs[`gp_reading_${idx}`] = 'GP reading is required';
          if (!m.failed_job_record?.fresh_reading) errs[`fresh_reading_${idx}`] = 'Fresh reading is required';
          if (!m.failed_job_record?.oil_drain_serial_number) errs[`oil_drain_serial_number_${idx}`] = 'Oil drain serial number is required';
        } else {
          const cpf = m.healthy_job_record?.tested_by_cpf || formData.line_staff_cpf;
          if (!cpf) errs[`tested_by_cpf_${idx}`] = 'Tester CPF is required';
          if (!m.healthy_job_record?.ryb_r_reading) errs[`ryb_r_${idx}`] = 'R-Phase reading is required';
          if (!m.healthy_job_record?.ryb_y_reading) errs[`ryb_y_${idx}`] = 'Y-Phase reading is required';
          if (!m.healthy_job_record?.ryb_b_reading) errs[`ryb_b_${idx}`] = 'B-Phase reading is required';
          if (!m.healthy_job_record?.spark_test) errs[`spark_test_${idx}`] = 'Spark test result is required';
        }
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

    const formattedMaterials = formData.materials.map(m => {
      const isFailed = (m.job_type === 'failed') || (m.condition === 'faulty');
      const itemPayload = {
        sr_no: m.sr_no,
        item_type: m.item_type || 'Transformer',
        make: m.make,
        serial_number: m.serial_number,
        job_number: m.job_number,
        capacity: m.capacity,
        village_name: m.village_name,
        group_number: m.group_number,
        dtc_number: m.dtc_number,
        condition: isFailed ? 'faulty' : (m.condition || 'new'),
        remarks: m.remarks
      };

      if (isFailed) {
        itemPayload.failed_job_record = {
          gp_reading: m.failed_job_record?.gp_reading || '',
          fresh_reading: m.failed_job_record?.fresh_reading || '',
          oil_drain_serial_number: m.failed_job_record?.oil_drain_serial_number || '',
          recorded_by_cpf: m.failed_job_record?.recorded_by_cpf || formData.line_staff_cpf || '100001'
        };
      } else {
        itemPayload.healthy_job_record = {
          ryb_r_reading: m.healthy_job_record?.ryb_r_reading || '100',
          ryb_y_reading: m.healthy_job_record?.ryb_y_reading || '100',
          ryb_b_reading: m.healthy_job_record?.ryb_b_reading || '100',
          spark_test: m.healthy_job_record?.spark_test || 'ok',
          tested_by_cpf: m.healthy_job_record?.tested_by_cpf || formData.line_staff_cpf || '100001'
        };
      }

      return itemPayload;
    });

    const payload = {
      ...formData,
      materials: formattedMaterials,
      status: actionStatus,
      // Convert empty IDs to null for optional foreign keys
      from_office_id: formData.from_office_id || null,
      to_office_id: formData.to_office_id || null,
      driver_id: formData.driver_id || null,
      contractor_id: formData.contractor_id || null,
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Linked Gate Pass Notification Banner */}
      {(linkedPass || formData.linked_gatepass_id) && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '20px'
              }}
            >
              🔗
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 2px 0' }}>
                Creating Return (Inward) Gate Pass linked to #{linkedPass?.display_id || linkedPass?.serial_number || formData.linked_gatepass_id}
              </h4>
              <p style={{ fontSize: '12px', color: '#1d4ed8', margin: 0, fontWeight: 500 }}>
                Origin and Destination offices have been automatically swapped. Materials & transport details pre-filled.
              </p>
            </div>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            Linked Lifecycle Pass
          </span>
        </div>
      )}

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
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#ffffff', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)' }}>
          <label
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: formData.type === 'outward' ? 'var(--accent-500)' : 'transparent',
              color: formData.type === 'outward' ? '#0f172a' : 'var(--gray-700)',
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
              onChange={() => handleTypeChange('outward')}
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
              backgroundColor: formData.type === 'inward' ? 'var(--pink-500)' : 'transparent',
              color: formData.type === 'inward' ? '#ffffff' : 'var(--gray-700)',
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
              onChange={() => handleTypeChange('inward')}
              style={{ display: 'none' }}
            />
            आवक (INWARD)
          </label>
        </div>
      </div>

      {/* Section 1 & 2: Gate Pass Date & Recipient Details */}
      <Card header="1. Gate Pass Identity & Recipient Details (प्रती)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <SearchableSelect
            label="प्रेषक कार्यालय (From Office)"
            value={formData.from_office_id}
            onChange={(val, item) => handleOfficeSelect('from_office_id', val, item)}
            options={officeOptions}
            placeholder="Select sending office..."
            allowCustom={false}
          />

          <SearchableSelect
            label="प्राप्तकर्ता कार्यालय (To Office)"
            value={formData.to_office_id}
            onChange={(val, item) => handleOfficeSelect('to_office_id', val, item)}
            options={officeOptions}
            placeholder="Select destination office..."
            allowCustom={false}
          />

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

        </div>
      </Card>

      {/* Section 2: Transport & Contractor Details */}
      <Card header="2. Transport & Contractor Details (ठेकेदारास व वाहतूक तपशील)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <SearchableSelect
              label="ठेकेदारास (Contractor Name)"
              value={formData.contractor_name || formData.contractor_id}
              onChange={(val, item) => {
                const target = item?.data || item || {};
                const firmName = target.name || target.company_name || target.contractor_firm || val;
                if (target.id) {
                  setFormData(prev => ({ ...prev, contractor_id: target.id, contractor_name: firmName }));
                } else {
                  setFormData(prev => ({ ...prev, contractor_id: '', contractor_name: firmName }));
                }
              }}
              options={contractorOptions}
              placeholder="Search or select contractor name..."
              allowCustom={true}
            />

            <div>
              <Button
                type="button"
                variant={showDriverDetails ? 'outline' : 'secondary'}
                icon={Truck}
                onClick={() => setShowDriverDetails(!showDriverDetails)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {showDriverDetails ? '— Remove / Hide Driver Details' : '+ Add Driver & Vehicle Details (Optional)'}
              </Button>
            </div>
          </div>

          {showDriverDetails && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '0.25rem'
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                🚛 Driver & Vehicle Assignment (चालक व गाडी तपशील)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <SearchableSelect
                  label="चालक निवडा (Select / Search Driver)"
                  value={formData.driver_id || formData.driver_name}
                  onChange={(val, item) => handleDriverSelect(val, item)}
                  options={(Array.isArray(drivers) ? drivers : []).map(d => ({
                    value: d.id,
                    label: d.name,
                    subtext: `Vehicle: ${d.vehicle_number || 'N/A'} | Mob: ${d.mobile || 'N/A'}`,
                    data: d
                  }))}
                  placeholder="Search or select driver..."
                  allowCustom={true}
                />

                <Input
                  label="सामान आणणाऱ्याचे नांव (Driver Name)"
                  placeholder="Auto-filled from driver lookup"
                  error={errors.driver_name}
                  value={formData.driver_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
                />

                <Input
                  label="गाडी नं. (Vehicle Number)"
                  placeholder="Auto-filled from driver lookup"
                  error={errors.vehicle_number}
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                />

                <Input
                  label="चालक मोबाईल नं. (Driver Phone)"
                  placeholder="Auto-filled from driver lookup"
                  error={errors.driver_mobile}
                  value={formData.driver_mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, driver_mobile: e.target.value }))}
                />
              </div>
            </div>
          )}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <SearchableSelect
                  label="DTC नं. (DTC Number)"
                  value={mat.dtc_number}
                  onChange={(val, item) => handleDTCSelect(idx, val, item)}
                  options={dtcOptions}
                  placeholder="Select or search DTC No..."
                  allowCustom={true}
                />

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

              {/* Job Record Status (Failed vs Healthy Options) */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: mat.job_type === 'failed' || mat.condition === 'faulty' ? '2px solid var(--danger-300, #fca5a5)' : '2px solid var(--success-300, #86efac)',
                  backgroundColor: mat.job_type === 'failed' || mat.condition === 'faulty' ? 'var(--danger-50, #fef2f2)' : 'var(--success-50, #f0fdf4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--gray-800)', textTransform: 'uppercase' }}>
                    ⚙️ Job Record Type / रोहित्र नमुना प्रकार:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleMaterialChange(idx, 'job_type', 'healthy')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: (mat.job_type || 'healthy') === 'healthy' && mat.condition !== 'faulty' ? 'var(--success-600, #16a34a)' : 'var(--gray-200, #e2e8f0)',
                        color: (mat.job_type || 'healthy') === 'healthy' && mat.condition !== 'faulty' ? '#ffffff' : 'var(--gray-700, #334155)',
                        boxShadow: (mat.job_type || 'healthy') === 'healthy' && mat.condition !== 'faulty' ? '0 2px 4px rgba(22, 163, 74, 0.2)' : 'none',
                      }}
                    >
                      ✅ Healthy Job (सुस्थितीत रोहित्र)
                    </button>
                    {formData.type !== 'outward' && (
                      <button
                        type="button"
                        onClick={() => handleMaterialChange(idx, 'job_type', 'failed')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm, 6px)',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: mat.job_type === 'failed' || mat.condition === 'faulty' ? 'var(--danger-600, #dc2626)' : 'var(--gray-200, #e2e8f0)',
                          color: mat.job_type === 'failed' || mat.condition === 'faulty' ? '#ffffff' : 'var(--gray-700, #334155)',
                          boxShadow: mat.job_type === 'failed' || mat.condition === 'faulty' ? '0 2px 4px rgba(220, 38, 38, 0.2)' : 'none',
                        }}
                      >
                        ⚠️ Failed Job (दूषित / जळालेले रोहित्र)
                      </button>
                    )}
                  </div>
                </div>

                {mat.job_type === 'failed' || mat.condition === 'faulty' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <SearchableSelect
                      label="1. Recording Official CPF / CPR No"
                      required
                      error={errors[`recorded_by_cpf_${idx}`]}
                      value={mat.failed_job_record?.recorded_by_cpf || formData.line_staff_cpf || ''}
                      onChange={(val, item) => handleJobRecordCPFSelect(idx, 'failed', val, item)}
                      options={cpfOptions}
                      placeholder="Search or select CPF / CPR No..."
                      allowCustom={true}
                    />
                    <Input
                      label="2. GP (GP Reading Textbox)"
                      required
                      error={errors[`gp_reading_${idx}`]}
                      placeholder="e.g. GP-102.5"
                      value={mat.failed_job_record?.gp_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'failed', 'gp_reading', e.target.value)}
                    />
                    <Input
                      label="3. Fresh (Fresh Reading Textbox)"
                      required
                      error={errors[`fresh_reading_${idx}`]}
                      placeholder="e.g. FR-98.0"
                      value={mat.failed_job_record?.fresh_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'failed', 'fresh_reading', e.target.value)}
                    />
                    <Input
                      label="4. Oil Drain Serial Number"
                      required
                      error={errors[`oil_drain_serial_number_${idx}`]}
                      placeholder="e.g. OD-77341"
                      value={mat.failed_job_record?.oil_drain_serial_number || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'failed', 'oil_drain_serial_number', e.target.value)}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <SearchableSelect
                      label="Tested By Employee CPF / CPR No"
                      required
                      error={errors[`tested_by_cpf_${idx}`]}
                      value={mat.healthy_job_record?.tested_by_cpf || formData.line_staff_cpf || ''}
                      onChange={(val, item) => handleJobRecordCPFSelect(idx, 'healthy', val, item)}
                      options={cpfOptions}
                      placeholder="Search or select CPF / CPR No..."
                      allowCustom={true}
                    />
                    <Input
                      label="R-Phase Reading (Ampere)"
                      required
                      error={errors[`ryb_r_${idx}`]}
                      placeholder="e.g. 85 A"
                      value={mat.healthy_job_record?.ryb_r_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_r_reading', e.target.value)}
                    />
                    <Input
                      label="Y-Phase Reading (Ampere)"
                      required
                      error={errors[`ryb_y_${idx}`]}
                      placeholder="e.g. 84 A"
                      value={mat.healthy_job_record?.ryb_y_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_y_reading', e.target.value)}
                    />
                    <Input
                      label="B-Phase Reading (Ampere)"
                      required
                      error={errors[`ryb_b_${idx}`]}
                      placeholder="e.g. 86 A"
                      value={mat.healthy_job_record?.ryb_b_reading || ''}
                      onChange={(e) => handleJobRecordChange(idx, 'healthy', 'ryb_b_reading', e.target.value)}
                    />

                    <div>
                      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                        Spark Test Result <span style={{ color: 'var(--danger-500)' }}>*</span>
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          height: '40px',
                          backgroundColor: '#ffffff',
                          padding: '0 12px',
                          borderRadius: 'var(--radius-md, 6px)',
                          border: errors[`spark_test_${idx}`] ? '1px solid var(--danger-500)' : '1px solid var(--gray-300)'
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          <input
                            type="radio"
                            name={`spark_test_${idx}`}
                            value="ok"
                            checked={(mat.healthy_job_record?.spark_test || 'ok') === 'ok'}
                            onChange={() => handleJobRecordChange(idx, 'healthy', 'spark_test', 'ok')}
                          />
                          <span style={{ color: 'var(--success-700)' }}>OK (पास)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          <input
                            type="radio"
                            name={`spark_test_${idx}`}
                            value="not_ok"
                            checked={mat.healthy_job_record?.spark_test === 'not_ok'}
                            onChange={() => handleJobRecordChange(idx, 'healthy', 'spark_test', 'not_ok')}
                          />
                          <span style={{ color: 'var(--danger-700)' }}>NOT OK (नापास)</span>
                        </label>
                      </div>
                      {errors[`spark_test_${idx}`] && (
                        <p style={{ fontSize: '11px', color: 'var(--danger-500)', marginTop: 2, margin: 0 }}>
                          {errors[`spark_test_${idx}`]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 5 & 6: Line Staff & Sender Info */}
      <Card header="4. Destination Line Staff & Sender Verification">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <SearchableSelect
            label="CPF / CPR नं. (CPF / CPR Number)"
            value={formData.line_staff_cpf}
            onChange={(val, item) => handleCPFSelect(val, item)}
            options={cpfOptions}
            placeholder="Select or search CPF / CPR No..."
            allowCustom={true}
          />

          <Input
            label="लाइन स्टाफ नांव (Destination Staff Name)"
            placeholder="e.g. Rohit Salunkhe"
            value={formData.line_staff_name}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_name: e.target.value }))}
          />

          <Input
            label="लाइन स्टाफ मोबाईल (Staff Phone)"
            placeholder="10-digit mobile number"
            error={errors.line_staff_mobile}
            value={formData.line_staff_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, line_staff_mobile: e.target.value }))}
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
        <Button variant="secondary" icon={ArrowLeft} disabled={isSubmitting} onClick={() => router.back()}>
          Cancel
        </Button>

        <Button variant="outline" icon={Save} disabled={isSubmitting} onClick={() => handleSubmit('draft')}>
          Save as Draft
        </Button>

        <Button variant="accent" loading={isSubmitting} disabled={isSubmitting} onClick={() => handleSubmit('issued')}>
          {isEditMode ? 'Update Gate Pass' : 'Issue Gate Pass (निर्गमित करा)'}
        </Button>
      </div>
    </div>
  );
}
