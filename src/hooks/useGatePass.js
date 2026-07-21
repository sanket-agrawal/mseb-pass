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

  const refresh = useCallback(() => {
    setLoading(true);
    const data = getGatePasses(filters);
    setPasses(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createGatePass = (data) => {
    const created = createPassStore(data);
    refresh();
    return created;
  };

  const updateGatePass = (id, data) => {
    const updated = updatePassStore(id, data);
    refresh();
    return updated;
  };

  const updateStatus = (id, newStatus, remarks = '') => {
    const updated = updateStatusStore(id, newStatus, remarks);
    refresh();
    return updated;
  };

  const deleteGatePass = (id) => {
    deletePassStore(id);
    refresh();
  };

  const getPass = (id) => {
    return getGatePassById(id);
  };

  return {
    passes,
    loading,
    filters,
    setFilters,
    refresh,
    createGatePass,
    updateGatePass,
    updateStatus,
    deleteGatePass,
    getPass,
    getNextSerialNumber
  };
}
