'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import StatsCard from '@/components/dashboard/StatsCard';
import BarChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import HorizontalBar from '@/components/dashboard/HorizontalBar';
import GatePassTable from '@/components/gatepass/GatePassTable';
import DateRangeSelector from '@/components/ui/DateRangeSelector';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useGatePass } from '@/hooks/useGatePass';
import { computeStats } from '@/lib/analytics';
import { exportGatePassesToExcel } from '@/lib/excelExport';
import {
  FileText,
  Truck,
  RotateCcw,
  CheckCircle,
  Plus,
  Download,
  RefreshCw,
  Building2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { passes, loading, refresh } = useGatePass();
  const [datePreset, setDatePreset] = useState('all');

  const stats = useMemo(() => {
    return computeStats(passes, datePreset);
  }, [passes, datePreset]);

  const handleView = (pass) => {
    router.push(`/gatepass/${pass.id}`);
  };

  const handleDownloadPdf = (pass) => {
    toast.success(`Preparing PDF for ${pass.id}`);
  };

  const handleQuickExport = () => {
    toast.loading('Generating Excel file...', { id: 'dash-export' });
    try {
      exportGatePassesToExcel(passes);
      toast.success('Excel workbook exported successfully!', { id: 'dash-export' });
    } catch (e) {
      toast.error('Export failed', { id: 'dash-export' });
    }
  };

  return (
    <PageWrapper
      title="MSEB Sub Division Dondaicha"
      subtitle="Executive management information dashboard & transformer movement analytics."
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={Download} onClick={handleQuickExport}>
            Export Excel
          </Button>
          <Link href="/gatepass/new" style={{ textDecoration: 'none' }}>
            <Button variant="accent" icon={Plus}>
              New Gate Pass
            </Button>
          </Link>
        </div>
      }
    >
      {/* Control Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <DateRangeSelector value={datePreset} onChange={setDatePreset} />

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refresh}>
          Refresh Analytics
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        <StatsCard
          title="Total Passes"
          marathiTitle="एकूण गेट पास"
          value={stats.total}
          icon={FileText}
          color="primary"
          trend="Total recorded passes"
        />
        <StatsCard
          title="In Transit"
          marathiTitle="मार्गावर असणारे"
          value={stats.activeInTransit}
          icon={Truck}
          color="warning"
          trend="Active transport movements"
        />
        <StatsCard
          title="Pending Returns"
          marathiTitle="परतावा प्रलंबित"
          value={stats.pendingReturns}
          icon={RotateCcw}
          color="accent"
          trend="Awaiting inward return pass"
        />
        <StatsCard
          title="Completed"
          marathiTitle="पूर्ण झालेले पास"
          value={stats.completedCount}
          icon={CheckCircle}
          color="success"
          trend="Delivered and closed"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <Card header="Monthly Movement Trend (महिनानिहाय जावक व आवक)">
          <BarChart data={stats.monthlyTrend} />
        </Card>

        <Card header="Lifecycle Status Distribution (स्थिती विभागणी)">
          <DonutChart segments={stats.statusDistribution} />
        </Card>
      </div>

      {/* Details Row: Recent Passes + Top Substations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Recent Passes */}
        <Card
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Recent Gate Passes</span>
              <Link href="/gatepass" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          }
        >
          <GatePassTable
            passes={stats.recentPasses}
            onView={handleView}
            onDownload={handleDownloadPdf}
            loading={loading}
          />
        </Card>

        {/* Top Substations */}
        <Card header="Top Substations by Gate Pass Volume">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0.5rem 0' }}>
            {stats.topSubstations.map((sub, idx) => {
              const maxSubCount = Math.max(...stats.topSubstations.map(s => s.count), 1);
              const percent = Math.round((sub.count / maxSubCount) * 100);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary-600)', width: 16 }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{sub.count} passes</span>
                  </div>

                  <div style={{ width: '100%', height: 6, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--gray-100)', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--primary-600)', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Driver Performance Leaderboard */}
      <Card header="Driver Performance Leaderboard (चालक कामगिरी)">
        <HorizontalBar data={stats.driverPerformance} />
      </Card>
    </PageWrapper>
  );
}
