'use client';

import { useState } from 'react';
import { exportGatePassesToExcel } from '@/lib/excelExport';

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = (data, options = {}) => {
    setExporting(true);
    try {
      const filename = exportGatePassesToExcel(data, options);
      setExporting(false);
      return filename;
    } catch (e) {
      setExporting(false);
      throw e;
    }
  };

  return {
    exporting,
    exportToExcel
  };
}
