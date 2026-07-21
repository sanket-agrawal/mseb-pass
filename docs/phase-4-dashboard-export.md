# Phase 4: Dashboard, Analytics & Excel Export

## 🎯 Objective

Build the admin dashboard with real-time statistics, visual analytics, and comprehensive Excel export functionality. This phase transforms the app from a data entry tool into a management information system that demonstrates the value of digitalization to MSEB decision-makers.

---

## 📋 Prerequisites

- Phase 1 completed (design system, UI components)
- Phase 2 completed (gate pass CRUD, data store)
- Phase 3 completed (PDF generation)
- Sample/demo data available

---

## 📊 Dashboard Design

### Dashboard Layout (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│                    DASHBOARD HEADER                       │
│  Welcome back, Admin  |  Dondaicha Branch  |  Jul 2026   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Total    │ │ Active   │ │ Pending  │ │ Completed│   │
│  │  Gate     │ │ In       │ │ Returns  │ │ This     │   │
│  │  Passes   │ │ Transit  │ │          │ │ Month    │   │
│  │   164     │ │    8     │ │    12    │ │    45    │   │
│  │  ↑12%     │ │  ↓2      │ │  ↑3     │ │  ↑18%   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌───────────────────────┐ ┌────────────────────────┐   │
│  │                       │ │                        │   │
│  │   Monthly Trend       │ │   Status Distribution  │   │
│  │   (Bar Chart)         │ │   (Donut Chart)        │   │
│  │                       │ │                        │   │
│  │   ████                │ │      ████████          │   │
│  │   ████ ███            │ │    ██        ██        │   │
│  │   ████ ███ ████       │ │   █   45%     █       │   │
│  │   ████ ███ ████ ██    │ │    ██        ██        │   │
│  │   Jan Feb Mar Apr     │ │      ████████          │   │
│  │                       │ │                        │   │
│  └───────────────────────┘ └────────────────────────┘   │
│                                                          │
│  ┌───────────────────────┐ ┌────────────────────────┐   │
│  │  Recent Gate Passes   │ │  Top Substations       │   │
│  │                       │ │                        │   │
│  │  GP-164 → Shindkheda │ │  1. Shindkheda  (23)   │   │
│  │  GP-163 → Bahmne     │ │  2. Bahmne      (18)   │   │
│  │  GP-162 → Navapur    │ │  3. Navapur     (15)   │   │
│  │  GP-161 → Sakri      │ │  4. Sakri       (12)   │   │
│  │  GP-160 → Shirpur    │ │  5. Shirpur     (10)   │   │
│  │                       │ │                        │   │
│  │  View All →           │ │                        │   │
│  └───────────────────────┘ └────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Driver Performance                               │   │
│  │                                                    │   │
│  │  Manoj Pawra    ████████████████  23 trips        │   │
│  │  Raju Patil     ████████████      18 trips        │   │
│  │  Suresh Gavit   ██████████        15 trips        │   │
│  │  Rakesh Chavan  ████████          12 trips        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Step 1: Build Stats Computation (`lib/analytics.js`)

```javascript
export function computeStats(gatePasses, dateRange) {
  return {
    // Summary Cards
    total: gatePasses.length,
    totalThisMonth: countThisMonth(gatePasses),
    activeInTransit: countByStatus(gatePasses, ['in_transit', 'return_in_transit']),
    pendingReturns: countPendingReturns(gatePasses),
    completedThisMonth: countCompletedThisMonth(gatePasses),
    
    // Percentage changes (vs last month)
    totalChange: calculateChange(gatePasses, 'total'),
    completedChange: calculateChange(gatePasses, 'completed'),
    
    // Charts Data
    monthlyTrend: getMonthlyTrend(gatePasses, 6),      // Last 6 months
    statusDistribution: getStatusDistribution(gatePasses),
    capacityDistribution: getCapacityDistribution(gatePasses),
    
    // Lists
    recentPasses: getRecentPasses(gatePasses, 5),
    topSubstations: getTopSubstations(gatePasses, 5),
    driverPerformance: getDriverPerformance(gatePasses),
    
    // Time Metrics
    avgTransitTime: calculateAvgTransitTime(gatePasses),   // Hours
    avgCompletionTime: calculateAvgCompletionTime(gatePasses), // Hours
  };
}
```

**Computed Metrics:**

| Metric | Calculation | Display |
|---|---|---|
| Total Gate Passes | Count all non-cancelled | Large number + % change |
| Active In Transit | Status = in_transit OR return_in_transit | Count with indicator |
| Pending Returns | Outward + delivered + no return pass created | Count with warning |
| Completed This Month | Status = completed, completed this month | Count + % change |
| Monthly Trend | Group by month, count per month | Bar chart (6 months) |
| Status Distribution | Count per status | Donut chart |
| Top Substations | Group by destination, sort by count | Ranked list |
| Driver Performance | Group by driver, count trips | Horizontal bar chart |
| Avg Transit Time | Avg(delivered_at - dispatched_at) | Hours/Minutes |
| Capacity Distribution | Group by KVA capacity | Pie chart |

### Step 2: Build Chart Components (Pure CSS/SVG)

Since this is an MVP, use **pure CSS + SVG charts** instead of adding a chart library dependency.

#### `components/dashboard/BarChart.jsx`
```javascript
// Simple CSS bar chart
// Props: data = [{ label: 'Jan', value: 23 }, ...]
// Renders vertical bars with labels and values
// Uses CSS animations for bar height transitions
```

```css
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 16px 0;
  border-bottom: 2px solid var(--gray-200);
}

.bar-chart .bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary-600), var(--primary-400));
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 30px;
}

.bar-chart .bar:hover {
  background: linear-gradient(to top, var(--primary-700), var(--primary-500));
}

.bar-chart .bar .value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--gray-700);
}

.bar-chart .bar .label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  color: var(--gray-500);
  white-space: nowrap;
}
```

#### `components/dashboard/DonutChart.jsx`
```javascript
// SVG donut chart
// Props: segments = [{ label: 'Issued', value: 30, color: '#3b82f6' }, ...]
// Renders SVG circle with stroke-dasharray segments
// Center text shows total or primary percentage
```

#### `components/dashboard/HorizontalBar.jsx`
```javascript
// Horizontal progress bar chart for driver performance
// Props: items = [{ label: 'Manoj', value: 23, maxValue: 30 }]
// Renders horizontal bars with labels and counts
```

### Step 3: Build Dashboard Components

#### `components/dashboard/StatsCard.jsx`
```javascript
// Props: title, value, change (percentage), changeDirection (up/down), icon, color
// Displays: Large value, title below, change indicator with arrow
// Hover: Subtle lift animation
// Mobile: 2-column grid
// Desktop: 4-column grid

export function StatsCard({ title, value, change, trend, icon: Icon, color }) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__icon">
        <Icon size={24} />
      </div>
      <div className="stats-card__content">
        <span className="stats-card__value">{value}</span>
        <span className="stats-card__title">{title}</span>
      </div>
      {change !== undefined && (
        <div className={`stats-card__change stats-card__change--${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}
```

#### `components/dashboard/RecentPasses.jsx`
```javascript
// Shows last 5-10 gate passes with:
// - Serial number
// - Type badge (outward/inward)
// - Destination
// - Status badge
// - Time ago (e.g., "2 hours ago")
// - Click to navigate to detail
// "View All" link at bottom
```

#### `components/dashboard/TopSubstations.jsx`
```javascript
// Ranked list of substations by gate pass count
// Shows: Rank, name, count, progress bar (relative to max)
```

#### `components/dashboard/DriverLeaderboard.jsx`
```javascript
// Driver performance with horizontal bars
// Shows: Driver name, trip count, vehicle info
// Sortable by trips
```

### Step 4: Build Dashboard Page (`dashboard/page.js`)

```javascript
export default function DashboardPage() {
  const { gatePasses } = useGatePass();
  const stats = useMemo(() => computeStats(gatePasses), [gatePasses]);
  
  return (
    <PageWrapper title="Dashboard" subtitle="Overview of gate pass operations">
      {/* Date Range Selector */}
      <div className="dashboard-controls">
        <DateRangeSelector 
          value={dateRange} 
          onChange={setDateRange}
          presets={['Today', 'This Week', 'This Month', 'Last 3 Months', 'This Year']}
        />
        <Button variant="outline" icon={<RefreshCw />} onClick={refresh}>
          Refresh
        </Button>
      </div>
      
      {/* Stats Cards Row */}
      <div className="stats-grid">
        <StatsCard title="Total Gate Passes" value={stats.total} change={12} trend="up" icon={FileText} color="blue" />
        <StatsCard title="Active In Transit" value={stats.activeInTransit} icon={Truck} color="amber" />
        <StatsCard title="Pending Returns" value={stats.pendingReturns} icon={AlertCircle} color="red" />
        <StatsCard title="Completed (Month)" value={stats.completedThisMonth} change={18} trend="up" icon={CheckCircle} color="green" />
      </div>
      
      {/* Charts Row */}
      <div className="charts-grid">
        <Card title="Monthly Trend">
          <BarChart data={stats.monthlyTrend} />
        </Card>
        <Card title="Status Distribution">
          <DonutChart segments={stats.statusDistribution} />
        </Card>
      </div>
      
      {/* Details Row */}
      <div className="details-grid">
        <Card title="Recent Gate Passes">
          <RecentPasses passes={stats.recentPasses} />
        </Card>
        <Card title="Top Substations">
          <TopSubstations data={stats.topSubstations} />
        </Card>
      </div>
      
      {/* Driver Performance */}
      <Card title="Driver Performance">
        <DriverLeaderboard data={stats.driverPerformance} />
      </Card>
    </PageWrapper>
  );
}
```

### Step 5: Build Date Range Selector (`components/ui/DateRangeSelector.jsx`)

```javascript
// Preset buttons: Today, This Week, This Month, Last 3 Months, This Year, Custom
// Custom: Two date inputs (from, to)
// Compact on mobile (dropdown with presets)
```

### Step 6: Build Excel Export Page (`export/page.js`)

#### Export Page Layout:

```
┌──────────────────────────────────────────────────────┐
│  Export Data                                          │
│  Download gate pass records as Excel spreadsheets     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─── Filters ──────────────────────────────────┐   │
│  │                                               │   │
│  │  Date Range:  [From: ____] [To: ____]        │   │
│  │  Status:      [All ▼]                        │   │
│  │  Type:        [All ▼]                        │   │
│  │  Substation:  [All ▼]                        │   │
│  │  Driver:      [All ▼]                        │   │
│  │                                               │   │
│  │  Matching Records: 45                        │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── Export Options ────────────────────────────┐   │
│  │                                               │   │
│  │  ☑ Gate Pass Details                         │   │
│  │  ☑ Material/Transformer Details              │   │
│  │  ☑ Driver Information                        │   │
│  │  ☑ Status History                            │   │
│  │  ☐ Line Staff Details                        │   │
│  │                                               │   │
│  │  Format: [Excel (.xlsx) ▼]                   │   │
│  │                                               │   │
│  │  [📥 Export to Excel]  [📊 Export Summary]    │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── Preview ───────────────────────────────────┐   │
│  │  (Table showing first 10 rows of export)      │   │
│  │                                               │   │
│  │  Sr | Date | Type | Destination | KVA | ...   │   │
│  │  ─────────────────────────────────────────    │   │
│  │  164| 21/7 | Out  | Shindkheda  | 63  | ...   │   │
│  │  163| 20/7 | In   | Bahmne      | 25  | ...   │   │
│  │  ...                                          │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Step 7: Implement Excel Export (`lib/excelExport.js`)

```javascript
import * as XLSX from 'xlsx';

export function exportToExcel(gatePasses, options = {}) {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Gate Pass Summary
  const summaryData = gatePasses.map(gp => ({
    'Sr. No. (क्रमांक)': gp.serial_number,
    'Date (दिनांक)': formatDate(gp.date),
    'Type': gp.type === 'outward' ? 'Outward (जावक)' : 'Inward (आवक)',
    'Status': formatStatus(gp.status),
    'Recipient (प्रती)': gp.recipient_name,
    'Destination': `${gp.destination_substation}, ${gp.destination_section}`,
    'Vehicle No. (गाडी नं.)': gp.vehicle_number,
    'Driver': gp.driver_name,
    'Driver Mobile': gp.driver_mobile,
    'Contractor (ठेकेदार)': gp.contractor_name,
    'Transformer Make': gp.materials?.[0]?.make || '',
    'Transformer Sr. No.': gp.materials?.[0]?.serial_number || '',
    'Capacity (KVA)': gp.materials?.[0]?.capacity || '',
    'Village (गाव)': gp.materials?.[0]?.village_name || '',
    'DTC No.': gp.materials?.[0]?.dtc_number || '',
    'Condition': gp.materials?.[0]?.condition || '',
    'Line Staff': gp.line_staff_name,
    'Line Staff Mobile': gp.line_staff_mobile,
    'Remarks': gp.remarks,
    'Created At': formatDateTime(gp.created_at),
    'Linked Pass': gp.linked_gatepass_id || gp.return_gatepass_id || '',
  }));
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Auto-width columns
  const maxWidths = calculateMaxWidths(summaryData);
  summarySheet['!cols'] = maxWidths;
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Gate Passes');
  
  // Sheet 2: Material Details (if multiple materials per pass)
  if (options.includeMaterials) {
    const materialData = [];
    gatePasses.forEach(gp => {
      gp.materials?.forEach(mat => {
        materialData.push({
          'Gate Pass': `GP-${gp.serial_number}`,
          'Date': formatDate(gp.date),
          'Sr. No.': mat.sr_no,
          'Make (मेक)': mat.make,
          'Serial No. (सि.नं.)': mat.serial_number,
          'Job No. (जॉब नं.)': mat.job_number,
          'Capacity (क्षमता)': mat.capacity,
          'Village (गाव)': mat.village_name,
          'Group No.': mat.group_number,
          'DTC No.': mat.dtc_number,
          'Condition': mat.condition,
          'Remarks': mat.remarks,
        });
      });
    });
    const materialSheet = XLSX.utils.json_to_sheet(materialData);
    materialSheet['!cols'] = calculateMaxWidths(materialData);
    XLSX.utils.book_append_sheet(workbook, materialSheet, 'Materials');
  }
  
  // Sheet 3: Summary Statistics
  if (options.includeSummary) {
    const stats = computeExportStats(gatePasses);
    const statsData = [
      { Metric: 'Total Gate Passes', Value: stats.total },
      { Metric: 'Outward Passes', Value: stats.outward },
      { Metric: 'Inward Passes', Value: stats.inward },
      { Metric: 'Completed', Value: stats.completed },
      { Metric: 'In Transit', Value: stats.inTransit },
      { Metric: 'Pending Returns', Value: stats.pendingReturns },
      { Metric: 'Date Range', Value: `${stats.dateFrom} to ${stats.dateTo}` },
      { Metric: 'Most Active Driver', Value: stats.topDriver },
      { Metric: 'Most Served Substation', Value: stats.topSubstation },
      { Metric: 'Total Transformers Moved', Value: stats.totalTransformers },
    ];
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary');
  }
  
  // Sheet 4: Driver Summary
  if (options.includeDrivers) {
    const driverData = computeDriverSummary(gatePasses);
    const driverSheet = XLSX.utils.json_to_sheet(driverData);
    XLSX.utils.book_append_sheet(workbook, driverSheet, 'Drivers');
  }
  
  // Generate and download
  const filename = `MSEB_GatePasses_${formatDateForFile(new Date())}.xlsx`;
  XLSX.writeFile(workbook, filename);
  
  return filename;
}

// Helper: Calculate column widths based on content
function calculateMaxWidths(data) {
  if (!data.length) return [];
  const keys = Object.keys(data[0]);
  return keys.map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    ) + 2
  }));
}
```

### Step 8: Export Preview Table

Show a preview of what will be exported before the user downloads:

```javascript
// components/export/ExportPreview.jsx
// Shows first 10 rows in a scrollable table
// Columns match the Excel output
// "Showing 10 of 45 records" indicator
```

### Step 9: Quick Export from Gate Pass List

Add export functionality directly to the gate pass list page:

```javascript
// On gatepass/page.js, add:
// 1. "Export Filtered" button in the toolbar
// 2. Checkbox selection for bulk export
// 3. "Export Selected (3)" button when items are checked
```

### Step 10: Dashboard Responsive Design

```css
/* Mobile: Stack everything vertically */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .charts-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2-column charts */
@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 4-column stats, 2-column charts */
@media (min-width: 1025px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## ✅ Phase 4 Completion Checklist

- [ ] Analytics computation module (`lib/analytics.js`)
- [ ] StatsCard component with trend indicators
- [ ] Bar chart component (pure CSS)
- [ ] Donut chart component (SVG)
- [ ] Horizontal bar chart component
- [ ] Dashboard page with all widgets
- [ ] Date range selector with presets
- [ ] Recent gate passes widget with navigation
- [ ] Top substations ranked list
- [ ] Driver leaderboard
- [ ] Excel export with multiple sheets
- [ ] Export page with filters and preview
- [ ] Export preview table (first 10 rows)
- [ ] Quick export from gate pass list
- [ ] Auto-calculated column widths in Excel
- [ ] Responsive dashboard layout
- [ ] Loading skeletons for dashboard
- [ ] Dashboard auto-refresh

---

## 🤖 Structured Prompt for Phase 4

```
You are building Phase 4 of the MSEB Digital Gate Pass System. Phases 1-3 are complete (setup, CRUD, PDF generation).

PROJECT: MSEB Digital Gate Pass System  
PHASE: 4 - Dashboard, Analytics & Excel Export

CONTEXT: MSEB admin at Dondaicha office needs to see an overview of all gate pass operations — how many are active, pending returns, monthly trends, which substations receive the most transformers, and which drivers are most active. They also need to export data to Excel for record keeping and reporting.

TASK: Build the admin dashboard and Excel export system.

REQUIREMENTS:

1. ANALYTICS ENGINE (lib/analytics.js):
   Compute from localStorage gate pass data:
   - Total passes, active in transit, pending returns, completed this month
   - Month-over-month percentage change
   - Monthly trend (last 6 months)
   - Status distribution (for donut chart)
   - Top 5 substations by gate pass volume
   - Driver performance (trips per driver)
   - Average transit time and completion time
   - Transformer capacity distribution

2. CHART COMPONENTS (pure CSS/SVG, no external library):
   - BarChart: Vertical bars for monthly trend, CSS transitions, hover values
   - DonutChart: SVG circle with stroke-dasharray, center text
   - HorizontalBar: For driver performance, animated fill

3. DASHBOARD PAGE (dashboard/page.js):
   - 4 stat cards at top: Total, In Transit, Pending Returns, Completed
   - Each card: large number, title, change indicator (↑12%), color-coded icon
   - Charts row: Monthly trend (bar) + Status distribution (donut)
   - Details row: Recent 5 passes (clickable) + Top 5 substations
   - Driver performance: Horizontal bars with trip counts
   - Date range selector with presets (Today, This Week, This Month, etc.)
   - Responsive: 4-col → 2-col → 1-col on smaller screens
   - Skeleton loading states

4. EXCEL EXPORT (lib/excelExport.js using SheetJS/xlsx):
   Generate .xlsx with multiple sheets:
   - Sheet 1 "Gate Passes": All fields — serial no, date, type, status, recipient, destination, vehicle, driver, transformer details, remarks
   - Sheet 2 "Materials": Detailed transformer/material data per gate pass
   - Sheet 3 "Summary": Computed statistics
   - Sheet 4 "Drivers": Driver trip summary
   - Auto-calculated column widths
   - Bilingual headers (Marathi + English)

5. EXPORT PAGE (export/page.js):
   - Filter section: date range, status, type, substation, driver
   - "Matching Records: N" count
   - Checkboxes for which sheets to include
   - Export preview table (first 10 rows)
   - "Export to Excel" button with download
   - "Export Summary Only" button

6. QUICK EXPORT from gate pass list:
   - "Export Filtered" button in toolbar
   - Checkbox selection on individual passes
   - "Export Selected (N)" button

DESIGN: Dashboard should feel data-rich and informative. Use the established design system colors. Charts should be clean and animated. Stats cards should have subtle gradient backgrounds matching their color theme.

OUTPUT: Fully functional dashboard with live analytics and comprehensive Excel export. The dashboard should make a strong impression on MSEB officials as a management tool.
```

---

## 🚀 Next Phase

After Phase 4 is complete, proceed to **Phase 5: Sharing & Notifications** where you'll implement WhatsApp sharing, email delivery, and notification system.
