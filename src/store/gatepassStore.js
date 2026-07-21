import { seedDemoData } from '@/lib/seedData';

const STORAGE_KEY_PASSES = 'mseb_gatepasses';
const STORAGE_KEY_DRIVERS = 'mseb_drivers';
const STORAGE_KEY_SUBSTATIONS = 'mseb_substations';
const STORAGE_KEY_COUNTER = 'mseb_serial_counter';

function ensureInitialized() {
  if (typeof window === 'undefined') return;
  seedDemoData();
}

export function getGatePasses(filters = {}) {
  ensureInitialized();
  if (typeof window === 'undefined') return [];
  
  const raw = localStorage.getItem(STORAGE_KEY_PASSES);
  let passes = raw ? JSON.parse(raw) : [];

  // Filter application
  if (filters.status && filters.status !== 'all') {
    passes = passes.filter(p => p.status === filters.status);
  }
  if (filters.type && filters.type !== 'all') {
    passes = passes.filter(p => p.type === filters.type);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    passes = passes.filter(p => {
      const matchId = p.id.toLowerCase().includes(q);
      const matchDriver = (p.driver_name || '').toLowerCase().includes(q);
      const matchSub = (p.destination_substation || '').toLowerCase().includes(q);
      const matchMat = (p.materials || []).some(m =>
        (m.serial_number || '').toLowerCase().includes(q) ||
        (m.capacity || '').toLowerCase().includes(q) ||
        (m.make || '').toLowerCase().includes(q)
      );
      return matchId || matchDriver || matchSub || matchMat;
    });
  }

  return passes;
}

export function getGatePassById(id) {
  ensureInitialized();
  if (typeof window === 'undefined') return null;
  const passes = getGatePasses();
  return passes.find(p => p.id === id) || null;
}

export function getNextSerialNumber() {
  ensureInitialized();
  if (typeof window === 'undefined') return { serial: 100, id: 'GP-2026-0100' };
  const current = parseInt(localStorage.getItem(STORAGE_KEY_COUNTER) || '168', 10);
  const year = new Date().getFullYear();
  const padSerial = String(current).padStart(4, '0');
  return {
    serial: current,
    id: `GP-${year}-${padSerial}`
  };
}

export function createGatePass(passData) {
  ensureInitialized();
  if (typeof window === 'undefined') return null;

  const { serial, id } = getNextSerialNumber();
  const now = new Date().toISOString();

  const newPass = {
    id,
    serial_number: serial,
    created_at: now,
    updated_at: now,
    created_by: 'Admin Dondaicha',
    type: passData.type || 'outward',
    status: passData.status || 'issued',
    date: passData.date || now.split('T')[0],
    recipient_name: passData.recipient_name || '',
    recipient_designation: passData.recipient_designation || '',
    destination_section: passData.destination_section || '',
    destination_substation: passData.destination_substation || '',
    destination_division: passData.destination_division || 'Dhule',
    vehicle_number: passData.vehicle_number || '',
    driver_id: passData.driver_id || '',
    driver_name: passData.driver_name || '',
    driver_mobile: passData.driver_mobile || '',
    contractor_name: passData.contractor_name || 'M/S Standard Electrotech Service',
    materials: passData.materials || [],
    line_staff_name: passData.line_staff_name || '',
    line_staff_mobile: passData.line_staff_mobile || '',
    line_staff_cpf: passData.line_staff_cpf || '',
    sender_name: passData.sender_name || 'SDO Dondaicha',
    sender_designation: passData.sender_designation || 'Sub Divisional Officer',
    receiver_name: passData.receiver_name || '',
    receiver_designation: passData.receiver_designation || '',
    linked_gatepass_id: passData.linked_gatepass_id || null,
    return_gatepass_id: null,
    remarks: passData.remarks || 'वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.',
    dispatched_at: passData.status === 'issued' || passData.status === 'in_transit' ? now : null,
    delivered_at: passData.status === 'delivered' ? now : null
  };

  const passes = getGatePasses();
  const updatedPasses = [newPass, ...passes];
  localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(updatedPasses));
  localStorage.setItem(STORAGE_KEY_COUNTER, String(serial + 1));

  // If this pass was created as a return pass linked to an outward pass, update outward pass return_gatepass_id link
  if (passData.linked_gatepass_id) {
    updateGatePass(passData.linked_gatepass_id, { return_gatepass_id: id });
  }

  return newPass;
}

export function updateGatePass(id, updatedFields) {
  ensureInitialized();
  if (typeof window === 'undefined') return null;

  const passes = getGatePasses();
  let updatedPass = null;
  const now = new Date().toISOString();

  const updatedPasses = passes.map(p => {
    if (p.id === id) {
      updatedPass = {
        ...p,
        ...updatedFields,
        updated_at: now
      };
      return updatedPass;
    }
    return p;
  });

  localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(updatedPasses));
  return updatedPass;
}

export function updatePassStatus(id, newStatus, additionalRemarks = '') {
  const now = new Date().toISOString();
  const updates = { status: newStatus };

  if (newStatus === 'in_transit' || newStatus === 'return_in_transit') {
    updates.dispatched_at = now;
  } else if (newStatus === 'delivered' || newStatus === 'completed') {
    updates.delivered_at = now;
  }

  if (additionalRemarks) {
    const existing = getGatePassById(id);
    if (existing) {
      updates.remarks = `${existing.remarks || ''}\n[${now.split('T')[0]}] Status changed to ${newStatus}: ${additionalRemarks}`;
    }
  }

  return updateGatePass(id, updates);
}

export function deleteGatePass(id) {
  ensureInitialized();
  if (typeof window === 'undefined') return;
  const passes = getGatePasses();
  const filtered = passes.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(filtered));
}

// Driver operations
export function getDrivers() {
  ensureInitialized();
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_DRIVERS);
  return raw ? JSON.parse(raw) : [];
}

export function saveDriver(driverData) {
  ensureInitialized();
  const drivers = getDrivers();
  let updated;

  if (driverData.id) {
    updated = drivers.map(d => d.id === driverData.id ? { ...d, ...driverData } : d);
  } else {
    const newDrv = {
      ...driverData,
      id: `drv_${String(Date.now()).slice(-4)}`,
      is_active: true,
      total_trips: 0
    };
    updated = [...drivers, newDrv];
  }

  localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
  return updated;
}

// Substation operations
export function getSubstations() {
  ensureInitialized();
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_SUBSTATIONS);
  return raw ? JSON.parse(raw) : [];
}

export function saveSubstation(substationData) {
  ensureInitialized();
  const substations = getSubstations();
  let updated;

  if (substationData.id) {
    updated = substations.map(s => s.id === substationData.id ? { ...s, ...substationData } : s);
  } else {
    const newSub = {
      ...substationData,
      id: `sub_${String(Date.now()).slice(-4)}`,
      is_active: true
    };
    updated = [...substations, newSub];
  }

  localStorage.setItem(STORAGE_KEY_SUBSTATIONS, JSON.stringify(updated));
  return updated;
}
