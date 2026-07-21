# Phase 2: Data Models & Gate Pass CRUD

## 🎯 Objective

Build the core data layer and gate pass creation/management functionality. This phase implements the gate pass form (mirroring the physical yellow paper), driver management, substation directory, and all CRUD operations using localStorage (with Supabase migration path ready).

---

## 📋 Prerequisites

- Phase 1 completed (project skeleton, design system, UI components)
- All layout components working
- Understanding of the physical gate pass fields (see Phase 1)

---

## 🗄️ Data Models

### Gate Pass Schema

```javascript
{
  // System Fields
  id: "GP-2026-0164",             // Auto-generated: GP-YYYY-XXXX
  created_at: "2026-07-21T14:00:00Z",
  updated_at: "2026-07-21T15:30:00Z",
  created_by: "admin",             // User who created

  // Gate Pass Identity
  serial_number: 164,              // क्रमांक - Sequential number
  type: "outward",                 // "outward" (जावक) | "inward" (आवक)
  status: "issued",                // See status enum
  date: "2026-07-21",              // दिनांक

  // Recipient / Destination
  recipient_name: "Assistant Engineer",       // प्रती - To whom
  recipient_designation: "AE",
  destination_section: "Virdel Section",      // Section name
  destination_substation: "Shindkheda S/dn",  // Substation / Sub-division
  destination_division: "Dhule",              // Division

  // Transport Details
  vehicle_number: "MH02 680689",   // गाडी नं.
  driver_id: "drv_001",            // Reference to driver
  driver_name: "Manoj Pawra",      // सामान आणणाऱ्याचे नांव
  driver_mobile: "9876543210",     // Driver's phone number
  contractor_name: "M/S Standard Electrotech Service",  // ठेकेदारास

  // Transformer / Material Details
  materials: [
    {
      sr_no: 1,                    // अ.नं.
      item_type: "Transformer",    // Type of material
      make: "SVJ",                 // मेक
      serial_number: "845",        // सि.नं.
      job_number: "FV-401",        // जॉब नं.
      capacity: "63 KVA",          // क्षमता
      village_name: "Chaugaon",    // गावाचे नांव
      group_number: "Gao",        // ग्रूप नं.
      dtc_number: "4221318",       // DTC नं.
      condition: "new",            // "new" | "repaired" | "faulty"
      remarks: ""                  // शेरा
    }
  ],

  // Line Staff / Contact at Destination
  line_staff_name: "Rohit Salunkhe",
  line_staff_mobile: "9427166630",
  line_staff_cpf: "2645050",

  // Signatures & Verification
  sender_name: "",                 // देणाऱ्याची सही व हुद्दा
  sender_designation: "",
  receiver_name: "",               // घेणाऱ्याची सही व हुद्दा
  receiver_designation: "",

  // Linked Gate Pass (for return trips)
  linked_gatepass_id: null,        // If this is a return, link to original outward pass
  return_gatepass_id: null,        // If outward, link to the return pass when created

  // Remarks
  remarks: "वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही.",
  
  // Tracking
  dispatched_at: null,             // When driver left with material
  delivered_at: null,              // When material reached destination
  return_dispatched_at: null,      // When faulty material sent back
  return_delivered_at: null        // When faulty material reached depot
}
```

### Driver Schema

```javascript
{
  id: "drv_001",
  name: "Manoj Pawra",
  mobile: "9876543210",
  license_number: "MH02-XXXX-XXXX",
  vehicle_number: "MH02 680689",
  vehicle_type: "truck",          // "truck" | "pickup" | "tempo"
  is_active: true,
  total_trips: 45,
  created_at: "2026-01-15T00:00:00Z"
}
```

### Substation Schema

```javascript
{
  id: "sub_001",
  name: "Shindkheda S/dn",
  section: "Virdel Section",
  division: "Dhule",
  type: "substation",             // "substation" | "section_office" | "division_office"
  contact_person: "Rohit Salunkhe",
  contact_mobile: "9427166630",
  address: "Shindkheda, Dist. Dhule",
  is_active: true
}
```

---

## 📝 Implementation Steps

### Step 1: Create Data Store (`store/gatepassStore.js`)

A localStorage-based state management system that mirrors the Supabase API shape for easy migration later.

```javascript
// Pattern: Each entity has these operations
const store = {
  // Gate Passes
  getGatePasses: (filters) => {},     // List with filtering
  getGatePass: (id) => {},            // Get by ID
  createGatePass: (data) => {},       // Create new
  updateGatePass: (id, data) => {},   // Update existing
  deleteGatePass: (id) => {},         // Soft delete
  
  // Drivers
  getDrivers: () => {},
  getDriver: (id) => {},
  createDriver: (data) => {},
  updateDriver: (id, data) => {},
  
  // Substations
  getSubstations: () => {},
  getSubstation: (id) => {},
  createSubstation: (data) => {},
  updateSubstation: (id, data) => {},
  
  // Utilities
  getNextSerialNumber: () => {},      // Auto-increment serial
  generateGatePassId: () => {},       // Generate GP-YYYY-XXXX
  getStats: () => {},                 // Dashboard stats
};
```

**Key Implementation Details:**
- Use `localStorage` with keys: `mseb_gatepasses`, `mseb_drivers`, `mseb_substations`, `mseb_serial_counter`
- All operations should be synchronous for localStorage
- Wrap in try-catch for storage quota errors
- Add seed data function for demo purposes

### Step 2: Create Custom Hooks

#### `hooks/useGatePass.js`
```javascript
// Provides reactive gate pass operations
export function useGatePass() {
  return {
    gatePasses,        // All gate passes (filtered)
    loading,           // Loading state
    error,             // Error state
    createGatePass,    // Create with validation
    updateGatePass,    // Update with validation
    deleteGatePass,    // Soft delete
    getGatePass,       // Get single by ID
    filters,           // Current filters
    setFilters,        // Update filters
    refresh            // Force refresh from store
  };
}
```

#### `hooks/useDrivers.js`
```javascript
export function useDrivers() {
  return {
    drivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getDriver,
    refresh
  };
}
```

### Step 3: Build Gate Pass Form (`components/gatepass/GatePassForm.jsx`)

This is the most critical component — it must capture all fields from the physical gate pass.

#### Form Sections:

**Section 1: Gate Pass Info**
- Type: Outward (जावक) / Inward (आवक) — Radio buttons
- Date (दिनांक) — Date picker, defaults to today
- Serial Number (क्रमांक) — Auto-generated, displayed but not editable

**Section 2: Recipient Details (प्रती)**
- Recipient Name & Designation — Text inputs
- Destination Section — Dropdown (from substations) or text input
- Destination Substation — Dropdown (from substations) or text input
- Division — Auto-filled from substation selection

**Section 3: Transport Details**
- Driver — Dropdown (from drivers list) — auto-fills vehicle, mobile
- Vehicle Number (गाडी नं.) — Auto-filled from driver, editable
- Driver Mobile — Auto-filled from driver, editable
- Contractor Name (ठेकेदारास) — Defaults to "M/S Standard Electrotech Service"

**Section 4: Material Details (मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन)**
- Dynamic list (add/remove items)
- Per item:
  - Sr. No. (अ.नं.) — Auto
  - Make (मेक) — Text
  - Serial No. (सि.नं.) — Text
  - Job No. (जॉब नं.) — Text
  - Capacity (क्षमता) — Dropdown (10, 16, 25, 63, 100, 200, 315, 500 KVA)
  - Village Name (गावाचे नांव) — Text
  - Group No. (ग्रूप नं.) — Text
  - DTC No. — Text
  - Condition — Dropdown (New/Repaired/Faulty)
  - Remarks (शेरा) — Text

**Section 5: Line Staff / Contact at Destination**
- Name — Text
- Mobile — Tel input
- CPF Number — Text

**Section 6: Sender Details (देणाऱ्याची सही व हुद्दा)**
- Name — Text
- Designation — Text

**Section 7: Remarks (शेरा)**
- Textarea with default template:
  "वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil Leakage नाही."

**Section 8: Actions**
- Save as Draft
- Issue Gate Pass (validates all required fields)
- Cancel

#### Form Validation Rules:
```javascript
const validationRules = {
  type: { required: true },
  date: { required: true },
  recipient_name: { required: true },
  destination_substation: { required: true },
  driver_name: { required: true },
  vehicle_number: { required: true, pattern: /^[A-Z]{2}\d{2}\s?\w+$/ },
  driver_mobile: { required: true, pattern: /^[6-9]\d{9}$/ },
  'materials[0].make': { required: true },
  'materials[0].serial_number': { required: true },
  'materials[0].capacity': { required: true },
  sender_name: { required: true },
};
```

### Step 4: Build Gate Pass List Page (`gatepass/page.js`)

- **View Toggle**: Card view / Table view (default: Card on mobile, Table on desktop)
- **Filters Bar**:
  - Status filter (All, Draft, Issued, In Transit, Delivered, etc.)
  - Type filter (All, Outward, Inward)
  - Date range filter
  - Search (by serial no, driver, destination, transformer serial)
- **Sorting**: By date (newest first default), serial number, status
- **Actions per gate pass**:
  - View details
  - Edit (only if draft/issued)
  - Generate PDF
  - Share (WhatsApp/Email)
  - Create return gate pass (for outward passes)
  - Update status
- **Bulk actions**: Export selected to Excel
- **Pagination**: 20 per page (or infinite scroll)

### Step 5: Build Gate Pass Detail View (`gatepass/[id]/page.js`)

- Full gate pass display in a card layout
- **Header**: Serial number, type badge, status badge, date
- **Status Timeline**: Visual timeline showing all status transitions
- **Details Sections**: Mirroring the form sections but in read-only display
- **Material Table**: All materials in a clean table
- **Actions Bar**:
  - Edit (if draft/issued)
  - Download PDF
  - Share via WhatsApp
  - Share via Email
  - Update Status (with confirmation)
  - Create Return Gate Pass
  - Print
- **Linked Gate Passes**: If this has a linked outward/return pass, show the connection
- **Activity Log**: Status change history with timestamps

### Step 6: Build Driver Management (`drivers/page.js`)

- **Driver List**: Table with name, mobile, vehicle, total trips, status
- **Add Driver Modal**: Form with name, mobile, license, vehicle details
- **Edit Driver**: Click to edit in modal
- **Deactivate Driver**: Soft delete (mark inactive)
- **Driver Stats**: Total trips, last trip date

### Step 7: Build Substation Directory (`substations/page.js`)

- **Substation List**: Table with name, section, division, contact person
- **Add Substation Modal**: Form with name, section, division, contact details
- **Edit/Deactivate**: Standard CRUD operations
- **Quick Select**: This feeds into the gate pass form dropdowns

### Step 8: Seed Demo Data

Create a function to populate localStorage with realistic demo data:
- 15-20 sample gate passes across all statuses
- 5-6 drivers
- 8-10 substations
- Realistic transformer details

```javascript
// lib/seedData.js
export function seedDemoData() {
  // Only seed if no data exists
  if (localStorage.getItem('mseb_gatepasses')) return;
  
  const drivers = [
    { id: 'drv_001', name: 'Manoj Pawra', mobile: '9876543210', vehicle_number: 'MH02 680689', vehicle_type: 'truck' },
    { id: 'drv_002', name: 'Raju Patil', mobile: '9823456789', vehicle_number: 'MH15 AB1234', vehicle_type: 'tempo' },
    // ... more
  ];
  
  const substations = [
    { id: 'sub_001', name: 'Shindkheda S/dn', section: 'Virdel Section', division: 'Dhule' },
    { id: 'sub_002', name: 'Bahmne Substation', section: 'Dondaicha Section', division: 'Dhule' },
    // ... more
  ];
  
  // Generate gate passes with various statuses
}
```

### Step 9: Create Return Gate Pass Flow

When a transformer reaches its destination, the faulty one needs to come back. Implement:

1. On an outward gate pass with status "delivered", show **"Create Return Gate Pass"** button
2. Pre-fill the return gate pass form with:
   - Type: "inward" (आवक)
   - Origin: The destination of the outward pass
   - Same driver (editable)
   - Material: Pre-fill but change condition to "faulty"
3. Link both gate passes: `outward.return_gatepass_id` ↔ `inward.linked_gatepass_id`
4. On the detail page, show the linked gate pass for easy navigation

### Step 10: Implement Status Updates

Create a status update flow with modal confirmation:

```
Outward Flow:
  Draft → Issued → In Transit → Delivered
  
Return Flow:
  Return Issued → Return In Transit → Completed

Any status → Cancelled (with reason)
```

Each status update should:
- Show confirmation modal with current → new status
- Record timestamp
- Update the gate pass
- Show success toast
- If "Delivered", prompt to create return gate pass

---

## ✅ Phase 2 Completion Checklist

- [ ] Data store (localStorage) with all CRUD operations
- [ ] Gate pass form with all fields matching physical form
- [ ] Form validation with error messages
- [ ] Gate pass list page with card + table views
- [ ] Filters (status, type, date range, search)
- [ ] Gate pass detail view with all information
- [ ] Status timeline visualization
- [ ] Status update flow with confirmations
- [ ] Driver management (list, add, edit, deactivate)
- [ ] Substation directory (list, add, edit)
- [ ] Return gate pass creation flow (linked passes)
- [ ] Dynamic material items (add/remove rows)
- [ ] Demo seed data loaded on first visit
- [ ] All forms work on mobile
- [ ] Toast notifications for all actions
- [ ] Auto-generated serial numbers and IDs

---

## 🤖 Structured Prompt for Phase 2

```
You are building Phase 2 of the MSEB Digital Gate Pass System. Phase 1 (project setup, design system, layout, UI components) is complete.

PROJECT: MSEB Digital Gate Pass System
PHASE: 2 - Data Models & Gate Pass CRUD

CONTEXT: This app digitalizes paper gate passes used by MSEB (Maharashtra State Electricity Board) for transformer transport. A paper gate pass is a yellow form with fields for: serial number (क्रमांक), date (दिनांक), recipient (प्रती), vehicle number (गाडी नं.), driver name, contractor name, and transformer details (make, serial no, job no, capacity in KVA, village name, DTC number).

There are two gate pass types:
- Outward (जावक): Sending a new/repaired transformer FROM depot TO substation
- Inward (आवक): Receiving a faulty transformer BACK from substation

Flow: Admin creates outward pass → Driver delivers transformer → Receives faulty one → Admin creates inward/return pass linked to original → Driver brings faulty transformer back

TASK: Implement complete data layer and gate pass CRUD operations.

REQUIREMENTS:

1. DATA STORE (store/gatepassStore.js):
   - localStorage-based with keys: mseb_gatepasses, mseb_drivers, mseb_substations, mseb_serial_counter
   - CRUD operations for: gate passes, drivers, substations
   - Auto-increment serial numbers (GP-YYYY-XXXX format)
   - Filter support (by status, type, date range, search text)
   - Stats computation (total passes, by status, by month)

2. GATE PASS FORM (components/gatepass/GatePassForm.jsx):
   Build a multi-section form matching the physical gate pass fields:
   - Section 1: Type (outward/inward radio), Date, Serial No. (auto)
   - Section 2: Recipient name, designation, destination section, substation, division
   - Section 3: Driver (dropdown from drivers list, auto-fills vehicle/mobile), vehicle number, contractor name
   - Section 4: Material details - dynamic list with add/remove. Each item: make, serial no, job no, capacity (KVA dropdown), village, group no, DTC no, condition (new/repaired/faulty), remarks
   - Section 5: Line staff name, mobile, CPF number
   - Section 6: Sender name and designation
   - Section 7: Remarks textarea with default Marathi template
   - Actions: Save Draft, Issue Gate Pass, Cancel
   - Validate required fields before issuing

3. GATE PASS LIST (gatepass/page.js):
   - Card view (mobile) and table view (desktop) toggle
   - Filter bar: status, type, date range, search
   - Per-item actions: view, edit, PDF, share, create return, update status
   - Sorting by date, serial number

4. GATE PASS DETAIL (gatepass/[id]/page.js):
   - Full read-only display of all gate pass fields
   - Status timeline visualization
   - Action buttons: edit, PDF, share, update status, create return
   - Linked gate pass navigation

5. DRIVER MANAGEMENT (drivers/page.js):
   - Table list with add/edit/deactivate via modals
   - Fields: name, mobile, license, vehicle number, vehicle type

6. SUBSTATION DIRECTORY (substations/page.js):
   - Table list with add/edit via modals
   - Fields: name, section, division, contact person, mobile

7. RETURN GATE PASS FLOW:
   - "Create Return" button on delivered outward passes
   - Pre-fill form with destination as origin, same driver, material with condition=faulty
   - Link both passes via linked_gatepass_id / return_gatepass_id

8. STATUS FLOW:
   Outward: draft → issued → in_transit → delivered
   Return: return_issued → return_in_transit → completed
   Any → cancelled (with reason)
   Each update: confirmation modal, timestamp, toast notification

9. SEED DATA (lib/seedData.js):
   - 15-20 sample gate passes across all statuses
   - 5-6 drivers, 8-10 substations
   - Load on first visit if no data exists

IMPORTANT: All data operations use localStorage now, but the API shape should mirror Supabase patterns (async functions, filter objects) so migration is seamless in Phase 6.

OUTPUT: Fully functional gate pass creation, listing, detail view, status management, driver management, and substation directory. All CRUD operations working with localStorage persistence.
```

---

## 🚀 Next Phase

After Phase 2 is complete, proceed to **Phase 3: PDF Generation & Digital Gate Pass** where you'll create a pixel-perfect PDF template mirroring the physical yellow gate pass and add print functionality.
