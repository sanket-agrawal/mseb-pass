'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDrivers, saveDriver, getSubstations, saveSubstation } from '@/store/gatepassStore';

export function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    setDrivers(getDrivers());
    setSubstations(getSubstations());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDriverData = (data) => {
    const updated = saveDriver(data);
    setDrivers(updated);
    return updated;
  };

  const saveSubstationData = (data) => {
    const updated = saveSubstation(data);
    setSubstations(updated);
    return updated;
  };

  return {
    drivers,
    substations,
    loading,
    refresh,
    saveDriver: saveDriverData,
    saveSubstation: saveSubstationData
  };
}
