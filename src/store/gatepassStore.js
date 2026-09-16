import { gatePassAPI, driverAPI, officeAPI, shareAPI } from '@/lib/api';

export async function getGatePasses(filters = {}) {
  try {
    const res = await gatePassAPI.list({ all: true, ...filters });
    return res?.data?.gatepasses || res?.data || [];
  } catch (err) {
    console.error('Error fetching gate passes:', err);
    return [];
  }
}

export async function getGatePassById(id) {
  try {
    const res = await gatePassAPI.get(id);
    return res?.data || null;
  } catch (err) {
    console.error(`Error fetching gate pass ${id}:`, err);
    return null;
  }
}

export async function getNextSerialNumber() {
  const year = new Date().getFullYear();
  return {
    serial: 1,
    id: `GP-${year}-AUTO`,
  };
}

export async function createGatePass(passData) {
  try {
    const res = await gatePassAPI.create(passData);
    return res?.data || null;
  } catch (err) {
    console.error('Error creating gate pass:', err);
    throw err;
  }
}

export async function updateGatePass(id, updatedFields) {
  try {
    // Currently backend status transition endpoint handles status updates
    if (updatedFields.status) {
      const res = await gatePassAPI.updateStatus(id, updatedFields.status, updatedFields.remarks);
      return res?.data || null;
    }
    if (updatedFields.vehicle_number) {
      const res = await gatePassAPI.addVehicle(id, updatedFields);
      return res?.data || null;
    }
    // General field updates (e.g., office IDs, vendor, etc.)
    const res = await gatePassAPI.update(id, updatedFields);
    return res?.data || null;
  } catch (err) {
    console.error(`Error updating gate pass ${id}:`, err);
    throw err;
  }
}

export async function updatePassStatus(id, newStatus, additionalRemarks = '') {
  try {
    const res = await gatePassAPI.updateStatus(id, newStatus, additionalRemarks);
    return res?.data || null;
  } catch (err) {
    console.error(`Error updating pass status for ${id}:`, err);
    throw err;
  }
}

export async function deleteGatePass(id) {
  try {
    const res = await gatePassAPI.delete(id);
    return res?.data || null;
  } catch (err) {
    console.error(`Error deleting gate pass ${id}:`, err);
    throw err;
  }
}

// Driver operations
export async function getDrivers(search) {
  try {
    const res = await driverAPI.list(search);
    return res?.data?.drivers || res?.data || [];
  } catch (err) {
    console.error('Error fetching drivers:', err);
    return [];
  }
}

export async function saveDriver(driverData) {
  try {
    if (driverData.id) {
      const res = await driverAPI.update(driverData.id, driverData);
      return res?.data || null;
    } else {
      const res = await driverAPI.create(driverData);
      return res?.data || null;
    }
  } catch (err) {
    console.error('Error saving driver:', err);
    throw err;
  }
}

// Share operation
export async function addShareLog(id, shareEntry) {
  try {
    await shareAPI.share(id, shareEntry.channel || 'whatsapp', shareEntry.recipient || shareEntry.target);
  } catch (err) {
    console.error(`Error sharing gate pass ${id}:`, err);
  }
}

// Office/Substation operations
export async function getSubstations() {
  try {
    const res = await officeAPI.list();
    return res?.data || [];
  } catch (err) {
    console.error('Error fetching offices:', err);
    return [];
  }
}

export async function saveSubstation(substationData) {
  try {
    if (substationData.id) {
      const res = await officeAPI.update(substationData.id, substationData);
      return res?.data || null;
    } else {
      const res = await officeAPI.create(substationData);
      return res?.data || null;
    }
  } catch (err) {
    console.error('Error saving office:', err);
    throw err;
  }
}
