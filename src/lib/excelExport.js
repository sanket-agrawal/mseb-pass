import * as XLSX from 'xlsx';

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
