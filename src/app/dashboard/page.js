'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DateRangeSelector from '@/components/ui/DateRangeSelector';
import StatsCard from '@/components/dashboard/StatsCard';
import BarChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import HorizontalBar from '@/components/dashboard/HorizontalBar';
import GatePassTable from '@/components/gatepass/GatePassTable';
import { useGatePass } from '@/hooks/useGatePass';
import { computeStats } from '@/lib/analytics';
import { dashboardAPI, exportAPI } from '@/lib/api';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import {
  FileText,
  Truck,
  RotateCcw,
  CheckCircle,
  Plus,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { passes, loading, refresh } = useGatePass();
  const [datePreset, setDatePreset] = useState('all');
  const [liveStats, setLiveStats] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.stats();
      if (res && res.data) {
        setLiveStats(res.data);
      }
    } catch (e) {
      console.warn('Dashboard stats fallback to local analytics:', e);
    }
  };

  const stats = useMemo(() => {
    const computed = computeStats(passes, datePreset);
    if (liveStats) {
      return {
        ...computed,
        total: liveStats.total ?? computed.total,
        issuedCount: liveStats.issued ?? computed.issuedCount,
        creditedCount: liveStats.credited ?? computed.creditedCount,
        completedCount: liveStats.completed ?? computed.completedCount,
        recentPasses: liveStats.recent_passes?.length ? liveStats.recent_passes : computed.recentPasses,
      };
    }
    return computed;
  }, [passes, datePreset, liveStats]);

  const handleView = (pass) => {
    router.push(`/gatepass/${pass.id}`);
  };

  const handleDownloadPdf = (pass) => {
    toast.success(`Opening PDF for ${pass.display_id || pass.id}`);
  };

  const handleQuickExport = async () => {
    toast.loading('Generating Excel report...', { id: 'dash-export' });
    try {
      const blob = await exportAPI.excel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gatepasses-${Date.now()}.xlsx`;
      a.click();
      toast.success('Excel exported successfully!', { id: 'dash-export' });
    } catch (e) {
      toast.error('Export failed', { id: 'dash-export' });
    }
  };

  const officeTitle = user?.office?.name || user?.branch || 'MSEB Digital Gate Pass';

  return (
    <PageWrapper
      title={officeTitle}
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
          gap: '1rem',
        }}
      >
        <DateRangeSelector value={datePreset} onChange={setDatePreset} />

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => { refresh(); fetchStats(); }}>
          Refresh Analytics
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatsCard
          title="Total Passes"
          marathiTitle="एकूण गेटपास"
          value={stats.total}
          icon={FileText}
          color="primary"
          trend="Total recorded passes"
        />
        <StatsCard
          title="Issued"
          marathiTitle="निर्गमित (Issued)"
          value={stats.issuedCount}
          icon={Truck}
          color="accent"
          trend="Active outward passes"
        />
        <StatsCard
          title="Credited"
          marathiTitle="जमा (Credited)"
          value={stats.creditedCount}
          icon={RotateCcw}
          color="warning"
          trend="Inward returned transformers"
        />
        <StatsCard
          title="Completed"
          marathiTitle="पूर्ण (Completed)"
          value={stats.completedCount}
          icon={CheckCircle}
          color="success"
          trend="Delivered & fully closed"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <Card header="Monthly Movement Trend (मासिक हालचाल अहवाल)">
          <BarChart data={stats.monthlyTrend} />
        </Card>

        <Card header="Lifecycle Status Distribution (स्थिती विवरण)">
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

      {/* Contractor Performance Leaderboard */}
      <Card header="Contractor Performance Leaderboard (कंत्राटदार कार्य अहवाल)">
        <HorizontalBar data={stats.contractorPerformance || stats.driverPerformance} />
      </Card>
    </PageWrapper>
  );
}
