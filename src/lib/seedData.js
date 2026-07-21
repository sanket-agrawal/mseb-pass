export const INITIAL_DRIVERS = [
  {
    id: 'drv_001',
    name: 'Manoj Pawra',
    mobile: '9876543210',
    license_number: 'MH18-2018-004321',
    vehicle_number: 'MH02 680689',
    vehicle_type: 'truck',
    is_active: true,
    total_trips: 45
  },
  {
    id: 'drv_002',
    name: 'Raju Patil',
    mobile: '9823456789',
    license_number: 'MH18-2019-008912',
    vehicle_number: 'MH18 AB1234',
    vehicle_type: 'tempo',
    is_active: true,
    total_trips: 28
  },
  {
    id: 'drv_003',
    name: 'Suresh Pawara',
    mobile: '9422267890',
    license_number: 'MH18-2020-012345',
    vehicle_number: 'MH18 CJ1102',
    vehicle_type: 'truck',
    is_active: true,
    total_trips: 34
  },
  {
    id: 'drv_004',
    name: 'Ganesh Bhil',
    mobile: '9765432109',
    license_number: 'MH18-2021-009876',
    vehicle_number: 'MH18 AH9876',
    vehicle_type: 'pickup',
    is_active: true,
    total_trips: 19
  },
  {
    id: 'drv_005',
    name: 'Dinesh Sonawane',
    mobile: '9921234567',
    license_number: 'MH18-2017-003412',
    vehicle_number: 'MH18 BZ5544',
    vehicle_type: 'truck',
    is_active: true,
    total_trips: 52
  }
];

export const INITIAL_SUBSTATIONS = [
  {
    id: 'sub_001',
    name: 'Shindkheda S/dn',
    section: 'Virdel Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'Rohit Salunkhe',
    contact_mobile: '9427166630',
    address: 'Shindkheda, Dist. Dhule',
    is_active: true
  },
  {
    id: 'sub_002',
    name: 'Dondaicha 132kV Substation',
    section: 'Dondaicha Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'Assistant Engineer',
    contact_mobile: '9823011223',
    address: 'Dondaicha EHV Yard, Dondaicha',
    is_active: true
  },
  {
    id: 'sub_003',
    name: 'Nardana 33kV Substation',
    section: 'Nardana Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'Junior Engineer Nardana',
    contact_mobile: '9421512345',
    address: 'Nardana MIDC Area',
    is_active: true
  },
  {
    id: 'sub_004',
    name: 'Shewade 33kV Substation',
    section: 'Shewade Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'S. K. Mahajan',
    contact_mobile: '9881122334',
    address: 'Shewade Village Road',
    is_active: true
  },
  {
    id: 'sub_005',
    name: 'Vikhran 33kV Substation',
    section: 'Vikhran Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'P. B. Chaudhari',
    contact_mobile: '9764433221',
    address: 'Vikhran Road, Dondaicha',
    is_active: true
  },
  {
    id: 'sub_006',
    name: 'Bahmne Substation',
    section: 'Bahmne Section',
    division: 'Dhule',
    type: 'substation',
    contact_person: 'V. R. Ahire',
    contact_mobile: '9420099887',
    address: 'Bahmne Bus Stand Road',
    is_active: true
  }
];

export const INITIAL_GATEPASSES = [
  {
    id: 'GP-2026-0164',
    serial_number: 164,
    type: 'outward',
    status: 'delivered',
    date: '2026-07-21',
    created_at: '2026-07-21T09:30:00Z',
    updated_at: '2026-07-21T12:00:00Z',
    created_by: 'Admin Dondaicha',
    recipient_name: 'Assistant Engineer',
    recipient_designation: 'AE',
    destination_section: 'Virdel Section',
    destination_substation: 'Shindkheda S/dn',
    destination_division: 'Dhule',
    vehicle_number: 'MH02 680689',
    driver_id: 'drv_001',
    driver_name: 'Manoj Pawra',
    driver_mobile: '9876543210',
    contractor_name: 'M/S Standard Electrotech Service',
    materials: [
      {
        sr_no: 1,
        item_type: 'Transformer',
        make: 'SVJ',
        serial_number: '845',
        job_number: 'FV-401',
        capacity: '63 KVA',
        village_name: 'Chaugaon',
        group_number: 'Gao',
        dtc_number: '4221318',
        condition: 'new',
        remarks: 'Tested OK'
      }
    ],
    line_staff_name: 'Rohit Salunkhe',
    line_staff_mobile: '9427166630',
    line_staff_cpf: '2645050',
    sender_name: 'Sub Divisional Officer',
    sender_designation: 'SDO Dondaicha',
    receiver_name: 'Rohit Salunkhe',
    receiver_designation: 'Line Staff',
    linked_gatepass_id: null,
    return_gatepass_id: 'GP-2026-0165',
    remarks: 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.',
    dispatched_at: '2026-07-21T10:00:00Z',
    delivered_at: '2026-07-21T12:00:00Z'
  },
  {
    id: 'GP-2026-0165',
    serial_number: 165,
    type: 'inward',
    status: 'return_in_transit',
    date: '2026-07-21',
    created_at: '2026-07-21T12:15:00Z',
    updated_at: '2026-07-21T12:30:00Z',
    created_by: 'Admin Dondaicha',
    recipient_name: 'Executive Engineer',
    recipient_designation: 'EE',
    destination_section: 'Dondaicha Section',
    destination_substation: 'Dondaicha 132kV Substation',
    destination_division: 'Dhule',
    vehicle_number: 'MH02 680689',
    driver_id: 'drv_001',
    driver_name: 'Manoj Pawra',
    driver_mobile: '9876543210',
    contractor_name: 'M/S Standard Electrotech Service',
    materials: [
      {
        sr_no: 1,
        item_type: 'Transformer',
        make: 'Crompton',
        serial_number: 'CG-9921',
        job_number: 'RET-102',
        capacity: '63 KVA',
        village_name: 'Chaugaon',
        group_number: 'Gao',
        dtc_number: '4221318',
        condition: 'faulty',
        remarks: 'Burnt coil returned for repair'
      }
    ],
    line_staff_name: 'Rohit Salunkhe',
    line_staff_mobile: '9427166630',
    line_staff_cpf: '2645050',
    sender_name: 'Rohit Salunkhe',
    sender_designation: 'Line Staff',
    receiver_name: 'Store Keeper',
    receiver_designation: 'Depot Incharge',
    linked_gatepass_id: 'GP-2026-0164',
    return_gatepass_id: null,
    remarks: 'दूषित / जळालेले रोहित्र परतीसाठी पाठवले. ऑइल गळती नाही.',
    dispatched_at: '2026-07-21T12:30:00Z',
    delivered_at: null
  },
  {
    id: 'GP-2026-0166',
    serial_number: 166,
    type: 'outward',
    status: 'in_transit',
    date: '2026-07-21',
    created_at: '2026-07-21T14:00:00Z',
    updated_at: '2026-07-21T14:15:00Z',
    created_by: 'Admin Dondaicha',
    recipient_name: 'Junior Engineer',
    recipient_designation: 'JE',
    destination_section: 'Nardana Section',
    destination_substation: 'Nardana 33kV Substation',
    destination_division: 'Dhule',
    vehicle_number: 'MH18 AB1234',
    driver_id: 'drv_002',
    driver_name: 'Raju Patil',
    driver_mobile: '9823456789',
    contractor_name: 'M/S Standard Electrotech Service',
    materials: [
      {
        sr_no: 1,
        item_type: 'Transformer',
        make: 'Kirloskar',
        serial_number: 'KE-2024-5511',
        job_number: 'JOB-908',
        capacity: '100 KVA',
        village_name: 'Nardana MIDC',
        group_number: 'Ind-1',
        dtc_number: '110293',
        condition: 'repaired',
        remarks: 'Overhauled transformer'
      }
    ],
    line_staff_name: 'Junior Engineer Nardana',
    line_staff_mobile: '9421512345',
    line_staff_cpf: '1182741',
    sender_name: 'Assistant Engineer Dondaicha',
    sender_designation: 'AE',
    receiver_name: '',
    receiver_designation: '',
    linked_gatepass_id: null,
    return_gatepass_id: null,
    remarks: 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.',
    dispatched_at: '2026-07-21T14:15:00Z',
    delivered_at: null
  },
  {
    id: 'GP-2026-0167',
    serial_number: 167,
    type: 'outward',
    status: 'draft',
    date: '2026-07-21',
    created_at: '2026-07-21T15:00:00Z',
    updated_at: '2026-07-21T15:00:00Z',
    created_by: 'Admin Dondaicha',
    recipient_name: 'Section Officer',
    recipient_designation: 'SO',
    destination_section: 'Shewade Section',
    destination_substation: 'Shewade 33kV Substation',
    destination_division: 'Dhule',
    vehicle_number: 'MH18 CJ1102',
    driver_id: 'drv_003',
    driver_name: 'Suresh Pawara',
    driver_mobile: '9422267890',
    contractor_name: 'M/S Standard Electrotech Service',
    materials: [
      {
        sr_no: 1,
        item_type: 'Transformer',
        make: 'ABB',
        serial_number: 'ABB-TR-8812',
        job_number: 'DRAFT-01',
        capacity: '200 KVA',
        village_name: 'Shewade',
        group_number: 'Grp-B',
        dtc_number: '887123',
        condition: 'new',
        remarks: 'New unit dispatch'
      }
    ],
    line_staff_name: 'S. K. Mahajan',
    line_staff_mobile: '9881122334',
    line_staff_cpf: '3341920',
    sender_name: 'Store Incharge',
    sender_designation: 'Store Keeper',
    receiver_name: '',
    receiver_designation: '',
    linked_gatepass_id: null,
    return_gatepass_id: null,
    remarks: 'मसुदा पास - स्वाक्षरी प्रलंबित.',
    dispatched_at: null,
    delivered_at: null
  }
];

export function seedDemoData() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mseb_gatepasses')) {
    localStorage.setItem('mseb_gatepasses', JSON.stringify(INITIAL_GATEPASSES));
  }
  if (!localStorage.getItem('mseb_drivers')) {
    localStorage.setItem('mseb_drivers', JSON.stringify(INITIAL_DRIVERS));
  }
  if (!localStorage.getItem('mseb_substations')) {
    localStorage.setItem('mseb_substations', JSON.stringify(INITIAL_SUBSTATIONS));
  }
  if (!localStorage.getItem('mseb_serial_counter')) {
    localStorage.setItem('mseb_serial_counter', '168');
  }
}
