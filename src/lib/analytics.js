import { GATEPASS_STATUS_CONFIG } from './constants';

export function filterPassesByPreset(passes, preset) {
  if (!Array.isArray(passes)) return [];
  if (!preset || preset === 'all') return passes;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (preset === 'today') {
    return passes.filter(p => (p.date ? p.date.split('T')[0] : '') === todayStr);
  }

  if (preset === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return passes.filter(p => new Date(p.date || p.created_at) >= oneWeekAgo);
  }

  if (preset === 'month') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return passes.filter(p => {
      const d = new Date(p.date || p.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  if (preset === 'last3months') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    return passes.filter(p => new Date(p.date || p.created_at) >= threeMonthsAgo);
  }

  return passes;
}

export function computeStats(allPasses = [], datePreset = 'all') {
  const safePasses = Array.isArray(allPasses) ? allPasses : [];
  const filteredPasses = filterPassesByPreset(safePasses, datePreset);
  const now = new Date();

  // Summary Metrics
  const total = filteredPasses.length;
  const issuedCount = filteredPasses.filter(p => p.status === 'issued').length;
  const creditedCount = filteredPasses.filter(p => p.status === 'credited').length;
  const completedCount = filteredPasses.filter(p => p.status === 'completed').length;

  // Monthly Trend (Last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const year = d.getFullYear();
    const label = `${monthNames[mIdx]} '${String(year).slice(-2)}`;
    
    const count = allPasses.filter(p => {
      const pDate = new Date(p.date || p.created_at);
      return pDate.getMonth() === mIdx && pDate.getFullYear() === year;
    }).length;

    monthlyTrend.push({ label, value: count || (i === 0 ? total : 0) });
  }

  // Status Distribution for Donut Chart
  const statusCounts = {};
  filteredPasses.forEach(p => {
    const st = p.status || 'issued';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  const statusColors = {
    issued: '#3b82f6',
    credited: '#f59e0b',
    completed: '#10b981',
  };

  const statusDistribution = Object.keys(statusCounts).map(status => ({
    label: GATEPASS_STATUS_CONFIG[status]?.label || status,
    value: statusCounts[status],
    color: statusColors[status] || '#64748b'
  }));

  // Top 5 Substations
  const subCounts = {};
  filteredPasses.forEach(p => {
    const sub = p.destination_substation || p.toSubstation || 'Other';
    subCounts[sub] = (subCounts[sub] || 0) + 1;
  });

  const topSubstations = Object.keys(subCounts)
    .map(name => ({ name, count: subCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Contractor Performance Leaderboard
  const contractorCounts = {};
  filteredPasses.forEach(p => {
    const contractor = p.contractor_name || p.contractor?.contractor_firm || p.contractor?.first_name || 'Direct MSEB';
    contractorCounts[contractor] = (contractorCounts[contractor] || 0) + 1;
  });

  const maxContractorTrips = Math.max(...Object.values(contractorCounts), 1);
  const contractorPerformance = Object.keys(contractorCounts)
    .map(name => ({
      name,
      count: contractorCounts[name],
      percentage: Math.round((contractorCounts[name] / maxContractorTrips) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    issuedCount,
    creditedCount,
    completedCount,
    monthlyTrend,
    statusDistribution,
    topSubstations,
    contractorPerformance,
    driverPerformance: contractorPerformance,
    recentPasses: filteredPasses.slice(0, 5)
  };
}
