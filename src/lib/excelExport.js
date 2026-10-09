import * as XLSX from 'xlsx';
import { GATEPASS_CATEGORY_MAP } from './constants';

function calculateColWidths(data) {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    ) + 3
  }));
}

export function exportGatePassesToExcel(gatePasses = [], options = {}) {
  const {
    includeMaterials = true,
    includeSummary = true,
    includeDrivers = true
  } = options;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Gate Passes Summary
  const passesData = gatePasses.map(gp => {
    const mat = gp.materials?.[0] || {};
    return {
      'Gate Pass ID': gp.id,
      'Serial No. (क्रमांक)': gp.serial_number || gp.id,
      'Date (दिनांक)': gp.date,
      'Type': gp.type === 'outward' ? 'Outward (जावक)' : 'Inward (आवक)',
      'Status': gp.status,
      'Recipient (प्रती)': gp.recipient_name,
      'Destination Substation': gp.destination_substation,
      'Section': gp.destination_section,
      'Vehicle No. (गाडी नं.)': gp.vehicle_number,
      'Driver Name': gp.driver_name,
      'Driver Mobile': gp.driver_mobile,
      'Contractor (ठेकेदारास)': gp.contractor_name,
      'DTC Number': gp.materials?.map(m => m.dtc_number || m.asset?.dtc_number).filter(Boolean).join(', ') || mat.dtc_number || '',
      'KVA': gp.materials?.map(m => m.capacity || m.asset?.capacity).filter(Boolean).join(', ') || mat.capacity || '',
      'Transformer Capacity': mat.capacity || '',
      'Transformer Make': mat.make || '',
      'Transformer Sr. No.': mat.serial_number || '',
      'Village Name': mat.village_name || '',
      'DTC No.': mat.dtc_number || '',
      'Line Staff Name': gp.line_staff_name || '',
      'Line Staff Mobile': gp.line_staff_mobile || '',
      'Category': gp.category ? (GATEPASS_CATEGORY_MAP[gp.category] || gp.category) : '',
      'Remarks (शेरा)': gp.remarks || ''
    };
  });

  const passesSheet = XLSX.utils.json_to_sheet(passesData);
  passesSheet['!cols'] = calculateColWidths(passesData);
  XLSX.utils.book_append_sheet(wb, passesSheet, 'Gate Passes');

  // Sheet 2: Materials Breakdown
  if (includeMaterials) {
    const materialsData = [];
    gatePasses.forEach(gp => {
      (gp.materials || []).forEach((m, idx) => {
        materialsData.push({
          'Gate Pass ID': gp.id,
          'Date': gp.date,
          'Item #': idx + 1,
          'Make (मेक)': m.make || '',
          'Serial No. (सि.नं.)': m.serial_number || '',
          'Job No. (जॉब नं.)': m.job_number || '',
          'Capacity (KVA)': m.capacity || '',
          'KVA': m.capacity || '',
          'DTC Number': m.dtc_number || '',
          'Village Name': m.village_name || '',
          'Group No.': m.group_number || '',
          'DTC No.': m.dtc_number || '',
          'Condition': m.condition || 'new',
          'Item Remarks': m.remarks || ''
        });
      });
    });

    const materialsSheet = XLSX.utils.json_to_sheet(materialsData);
    materialsSheet['!cols'] = calculateColWidths(materialsData);
    XLSX.utils.book_append_sheet(wb, materialsSheet, 'Materials');
  }

  // Sheet 3: Executive Summary
  if (includeSummary) {
    const totalCount = gatePasses.length;
    const outwardCount = gatePasses.filter(p => p.type === 'outward').length;
    const inwardCount = gatePasses.filter(p => p.type === 'inward').length;
    const completedCount = gatePasses.filter(p => p.status === 'completed' || p.status === 'delivered').length;

    const summaryData = [
      { Metric: 'Total Gate Passes', Value: totalCount },
      { Metric: 'Outward Passes (जावक)', Value: outwardCount },
      { Metric: 'Inward Passes (आवक)', Value: inwardCount },
      { Metric: 'Completed & Delivered', Value: completedCount },
      { Metric: 'Export Date', Value: new Date().toISOString().split('T')[0] },
      { Metric: 'Sub Division', Value: 'Dondaicha, Dist. Dhule' }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = calculateColWidths(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Executive Summary');
  }

  // Sheet 4: Driver Summary
  if (includeDrivers) {
    const drvCounts = {};
    gatePasses.forEach(p => {
      const name = p.driver_name || 'Unassigned';
      drvCounts[name] = (drvCounts[name] || 0) + 1;
    });

    const driverData = Object.keys(drvCounts).map(name => ({
      'Driver Name': name,
      'Total Gate Passes / Trips': drvCounts[name]
    }));

    const driverSheet = XLSX.utils.json_to_sheet(driverData);
    driverSheet['!cols'] = calculateColWidths(driverData);
    XLSX.utils.book_append_sheet(wb, driverSheet, 'Driver Summary');
  }

  const filename = `GatePasses_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

export function exportAssetOutwardTrackerToExcel(assetsList = [], options = {}) {
  const { sectionName = 'ALL', filenamePrefix = 'Asset_Outward_Tracker' } = options;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Assets Outward Frequency (Count >= 2)
  const summaryRows = assetsList.map(asset => {
    const sectionBreakdownStr = Object.entries(asset.sectionCounts || {})
      .map(([sec, cnt]) => `${sec} (${cnt}x)`)
      .join(', ');

    const allPassesIds = (asset.passes || []).map(p => p.display_id || p.pass_id).join(', ');
    const latestPass = asset.passes?.[asset.passes.length - 1] || {};

    return {
      'Asset Serial Number': asset.serial_number,
      'Asset Make': asset.make,
      'Equipment Type': asset.item_type || 'Transformer',
      'Capacity (KVA)': asset.capacity,
      'DTC Number': asset.dtc_number,
      'Village Name': asset.village_name || 'N/A',
      'Total Outward Issues (Count >= 2)': asset.totalOutwardCount,
      'Section Breakdown': sectionBreakdownStr,
      'Latest Destination Section': latestPass.section || 'N/A',
      'Latest GatePass ID': latestPass.display_id || latestPass.pass_id || 'N/A',
      'Latest Issue Date': asset.latestDate ? new Date(asset.latestDate).toISOString().split('T')[0] : 'N/A',
      'Latest Status': asset.latestStatus || latestPass.status || 'Issued',
      'Latest Line Staff Name': latestPass.line_staff_name || latestPass.recipient || 'N/A',
      'Latest Line Staff Mobile': latestPass.line_staff_mobile || 'N/A',
      'Latest Line Staff CPF': latestPass.line_staff_cpf || 'N/A',
      'Latest Driver Name': latestPass.driver_name || latestPass.driver || 'N/A',
      'Latest Driver Mobile': latestPass.driver_mobile || 'N/A',
      'Latest Vehicle Number': latestPass.vehicle_number || latestPass.vehicle || 'N/A',
      'Latest Contractor / Agency': latestPass.contractor_name || 'N/A',
      'Latest Issuing Officer (Sender)': latestPass.sender_name || 'N/A',
      'All Outward GatePass History': allPassesIds
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = calculateColWidths(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Assets Outward Frequency');

  // Sheet 2: Detailed Outward History Log per GatePass
  const historyRows = [];
  assetsList.forEach(asset => {
    (asset.passes || []).forEach(pass => {
      historyRows.push({
        'Asset Serial Number': asset.serial_number,
        'Asset Make': asset.make,
        'Capacity (KVA)': asset.capacity,
        'DTC Number': asset.dtc_number,
        'Gate Pass ID': pass.display_id || pass.pass_id,
        'Issue Date': pass.date ? new Date(pass.date).toISOString().split('T')[0] : 'N/A',
        'Destination Section': pass.section || 'N/A',
        'Destination Substation': pass.substation || 'N/A',
        'Line Staff Name': pass.line_staff_name || pass.recipient || 'N/A',
        'Line Staff Mobile': pass.line_staff_mobile || 'N/A',
        'Line Staff CPF': pass.line_staff_cpf || 'N/A',
        'Driver Name': pass.driver_name || pass.driver || 'N/A',
        'Driver Mobile': pass.driver_mobile || 'N/A',
        'Vehicle Number': pass.vehicle_number || pass.vehicle || 'N/A',
        'Contractor / Agency Firm': pass.contractor_name || 'N/A',
        'Issuing Officer (Sender)': pass.sender_name || 'N/A',
        'Condition': pass.condition || 'good',
        'Remarks': pass.remarks || ''
      });
    });
  });

  const historySheet = XLSX.utils.json_to_sheet(historyRows);
  historySheet['!cols'] = calculateColWidths(historyRows);
  XLSX.utils.book_append_sheet(wb, historySheet, 'Detailed GatePass History');

  // Sheet 3: Section Wise Metrics
  const sectionMetrics = {};
  assetsList.forEach(asset => {
    Object.entries(asset.sectionCounts || {}).forEach(([sec, cnt]) => {
      sectionMetrics[sec] = (sectionMetrics[sec] || 0) + cnt;
    });
  });

  const sectionRows = Object.entries(sectionMetrics).map(([sec, count]) => ({
    'Section Name': sec,
    'Outward GatePass Count': count
  }));

  const sectionSheet = XLSX.utils.json_to_sheet(sectionRows);
  sectionSheet['!cols'] = calculateColWidths(sectionRows);
  XLSX.utils.book_append_sheet(wb, sectionSheet, 'Section Breakdown');

  const cleanSectionStr = sectionName !== 'ALL' ? String(sectionName).replace(/[^a-zA-Z0-9]/g, '_') : 'All_Sections';
  const filename = `${filenamePrefix}_${cleanSectionStr}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}
