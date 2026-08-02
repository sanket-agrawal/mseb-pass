'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getGatePasses,
  getGatePassById,
  createGatePass as createPassStore,
  updateGatePass as updatePassStore,
  updatePassStatus as updateStatusStore,
  deleteGatePass as deletePassStore,
  getNextSerialNumber
} from '@/store/gatepassStore';

export function useGatePass(initialFilters = {}) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGatePasses(filters);
      setPasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching passes:', err);
      setPasses([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createGatePass = async (data) => {
    const created = await createPassStore(data);
    await refresh();
    return created;
  };

  const updateGatePass = async (id, data) => {
    const updated = await updatePassStore(id, data);
    await refresh();
    return updated;
  };

  const updateStatus = async (id, newStatus, remarks = '') => {
    const updated = await updateStatusStore(id, newStatus, remarks);
    await refresh();
    return updated;
  };

  const deleteGatePass = async (id) => {
    await deletePassStore(id);
    await refresh();
  };

  const getPass = async (id) => {
    return await getGatePassById(id);
  };

  return {
    passes,
    loading,
    filters,
    setFilters,
    refresh,
    createPass: createGatePass,
    createGatePass,
    updateGatePass,
    updateStatus,
    deleteGatePass,
    getPass,
    getNextSerialNumber
  };
}
