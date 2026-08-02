'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDrivers, saveDriver, getSubstations, saveSubstation } from '@/store/gatepassStore';

export function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dData, sData] = await Promise.all([
        getDrivers(),
        getSubstations(),
      ]);
      setDrivers(Array.isArray(dData) ? dData : []);
      setSubstations(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error('Error fetching drivers/substations:', err);
      setDrivers([]);
      setSubstations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDriverData = async (data) => {
    const updated = await saveDriver(data);
    await refresh();
    return updated;
  };

  const saveSubstationData = async (data) => {
    const updated = await saveSubstation(data);
    await refresh();
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
