'use client';

import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import EmptyState from '@/components/ui/EmptyState';
import { Download } from 'lucide-react';

export default function ExportPage() {
  return (
    <PageWrapper
      title="Export Gate Pass Data"
      subtitle="Export gate pass logs, transformer transport history, and driver logs to Excel."
    >
      <EmptyState
        icon={Download}
        title="Excel Data Export (Phase 4)"
        description="Date range filtering, custom column selection, and instant XLSX export will be enabled in Phase 4: Dashboard & Export."
      />
    </PageWrapper>
  );
}
