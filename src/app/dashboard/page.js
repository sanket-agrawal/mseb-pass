'use client';

import React from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import StatsCard from '@/components/dashboard/StatsCard';
import GatePassTable from '@/components/gatepass/GatePassTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useGatePass } from '@/hooks/useGatePass';
import { FileText, Truck, ArrowUpRight, ArrowDownLeft, Plus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { passes, loading } = useGatePass();

  const totalPasses = passes.length;
  const inTransitCount = passes.filter(p => p.status === 'in_transit' || p.status === 'return_in_transit').length;
  const outwardCount = passes.filter(p => p.gatePassType === 'outward').length;
  const inwardCount = passes.filter(p => p.gatePassType === 'inward').length;

  const handleView = (pass) => {
    router.push(`/gatepass/${pass.id}`);
  };

  const handleDownload = (pass) => {
    toast.success(`Preparing PDF for ${pass.id}`);
  };

  return (
    <PageWrapper
      title="MSEB Sub Division Dondaicha"
      subtitle="Overview of transformer transport, gate passes, and active movements."
      actions={
        <Link href="/gatepass/new" style={{ textDecoration: 'none' }}>
          <Button variant="accent" icon={Plus}>
            Create Gate Pass
          </Button>
        </Link>
      }
    >
      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatsCard
          title="Total Passes"
          marathiTitle="एकूण गेट पास"
          value={totalPasses}
          icon={FileText}
          color="primary"
          trend="All recorded movements"
        />
        <StatsCard
          title="In Transit"
          marathiTitle="मार्गावर असणारे"
          value={inTransitCount}
          icon={Truck}
          color="warning"
          trend="Active on-road transformers"
        />
        <StatsCard
          title="Outward (जावक)"
          marathiTitle="डेपोमधून पाठवलेले"
          value={outwardCount}
          icon={ArrowUpRight}
          color="accent"
          trend="Transformers dispatched"
        />
        <StatsCard
          title="Inward (आवक)"
          marathiTitle="डेपोमध्ये जमा झालेले"
          value={inwardCount}
          icon={ArrowDownLeft}
          color="success"
          trend="Transformers received"
        />
      </div>

      {/* Main Grid: Recent Passes + Quick Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Recent Gate Passes</span>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 400 }}>
                  Latest transformer movement records
                </span>
              </div>
              <Link href="/gatepass" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm">
                  View All Passes
                </Button>
              </Link>
            </div>
          }
        >
          <GatePassTable
            passes={passes.slice(0, 5)}
            onView={handleView}
            onDownload={handleDownload}
            loading={loading}
          />
        </Card>
      </div>
    </PageWrapper>
  );
}
