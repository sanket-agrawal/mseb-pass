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
  const isCredited = (p) =>
    p.status === 'credited' ||
    (p.type === 'inward' && (p.linked_gatepass_id || p.linked_gatepass));
  const isCompleted = (p) => p.status === 'completed';

  const issuedCount = filteredPasses.filter(p => p.type === 'outward').length;
  const creditedCount = filteredPasses.filter(isCredited).length;
  const completedCount = filteredPasses.filter(isCompleted).length;

  // Monthly Trend (Last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const year = d.getFullYear();
    const label = `${monthNames[mIdx]} '${String(year).slice(-2)}`;
    
    const monthPasses = allPasses.filter(p => {
      const pDate = new Date(p.date || p.created_at);
      return pDate.getMonth() === mIdx && pDate.getFullYear() === year;
    });

    const outward = monthPasses.filter(p => p.type === 'outward').length;
    const inward = monthPasses.filter(p => p.type === 'inward').length;
    const count = monthPasses.length;

    monthlyTrend.push({
      label,
      value: count || (i === 0 ? total : 0),
      outward: outward || (i === 0 ? issuedCount : 0),
      inward: inward || (i === 0 ? creditedCount : 0),
    });
  }

  // Status Distribution for Donut Chart
  const statusDistribution = [
    { label: 'Issued', value: issuedCount, color: '#3b82f6' },
    { label: 'Credited', value: creditedCount, color: '#f59e0b' },
    ...(completedCount ? [{ label: 'Completed', value: completedCount, color: '#10b981' }] : []),
  ];

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
    const contractor = p.contractor_name || p.contractor?.contractor_firm || p.contractor?.first_name || 'Direct / In-House';
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
