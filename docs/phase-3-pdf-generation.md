# Phase 3: PDF Generation & Digital Gate Pass

## 🎯 Objective

Create a pixel-perfect digital gate pass PDF that mirrors the physical yellow paper form used by MSEB. The PDF should be printable, downloadable, and shareable. Additionally, build a web-based preview of the gate pass that looks like the original form.

---

## 📋 Prerequisites

- Phase 1 completed (design system, layout, UI components)
- Phase 2 completed (gate pass CRUD, data store, forms)
- Gate passes can be created and stored
- `@react-pdf/renderer` already installed

---

## 🎨 Gate Pass PDF Design

### Physical Form Analysis (from the image)

The physical gate pass is a **yellow paper** with the following layout:

```
┌─────────────────────────────────────────────────────────┐
│  महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्या.             │
│  गाळण शाखा-दोंडाईचा जि.धुळे                             │
│                                                          │
│  क्रमांक- ___    गेट पास (जावक)    दिनांक- ___          │
│  प्रती, _______________________________________          │
│  गाडी नं. ___________                                    │
│  सामान आणणाऱ्याचे नांव, पत्ता व हुद्दा ______________    │
│  विजखात्यास/ठेकेदारास ____________________________       │
│                                                          │
│  ✻ मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन ✻              │
│  ┌────┬────┬─────┬──────┬─────┬──────────┬────┐         │
│  │अ.नं│मेक │सि.नं│जॉब नं│क्षमता│गावाचे नांव│शेरा│         │
│  │    │    │     │      │     │ग्रूप नं.  │    │         │
│  ├────┼────┼─────┼──────┼─────┼──────────┼────┤         │
│  │    │    │     │      │     │          │    │         │
│  └────┴────┴─────┴──────┴─────┴──────────┴────┘         │
│                                                          │
│  Line Staff - _______________                            │
│  Mob. No. - _________________                            │
│  CPF - ______________________                            │
│                                                          │
│  टिपणी: वरील सर्व रोहित्र तपासुन बघीतले त्यांचे         │
│  LT व HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन       │
│  Oil Leakage नाही.                                       │
│                                                          │
│  देणाऱ्याची सही व हुद्दा    घेणाऱ्याची सही व हुद्दा       │
│  _______________          _______________                │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Step 1: Create PDF Template (`components/gatepass/GatePassPDF.jsx`)

Using `@react-pdf/renderer`, create an A4 PDF that replicates the physical form.

```javascript
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Marathi-compatible font (Noto Sans Devanagari)
Font.register({
  family: 'NotoSansDevanagari',
  fonts: [
    { src: '/fonts/NotoSansDevanagari-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansDevanagari-Bold.ttf', fontWeight: 'bold' },
  ]
});
```

#### PDF Layout Specification:

**Page Setup:**
- Size: A4 (595.28 x 841.89 points)
- Margins: 40pt all sides
- Background: Light yellow (#FFF9C4) to mimic the physical form
- Border: 2pt solid dark border around the entire content area

**Header Section:**
- Organization name in Devanagari (bold, centered, 14pt)
- Branch name (centered, 12pt)
- Gate pass type badge: "गेट पास (जावक)" or "गेट पास (आवक)" (centered, bold, 16pt)

**Info Row:**
- Left: "क्रमांक- {serial_number}" (bold value, underlined)
- Center: Gate pass type
- Right: "दिनांक- {date}" (bold value, underlined)

**Details Section:**
- Each field on its own line with label and underlined value:
  - प्रती (To): recipient name + designation + destination
  - गाडी नं. (Vehicle No.): vehicle number
  - सामान आणणाऱ्याचे नांव (Driver): driver name
  - विजखात्यास/ठेकेदारास (Contractor): contractor name

**Material Table:**
- Header: "✻ मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन ✻"
- Table with columns: अ.नं. | मेक | सि.नं. | जॉब नं. | क्षमता | गावाचे नांव ग्रूप नं. | शेरा
- Table borders: 1pt solid
- Header row: Bold, slightly darker background
- Support multiple material rows

**Line Staff Section:**
- Line Staff name
- Mobile number
- CPF number

**Remarks Section:**
- "टिपणी:" label
- Remarks text (full width)

**Signature Section (bottom):**
- Two columns at bottom:
  - Left: "देणाऱ्याची सही व हुद्दा" + sender name + designation
  - Right: "घेणाऱ्याची सही व हुद्दा" + receiver name + designation

**Footer:**
- Digital gate pass ID (small, gray)
- Generated timestamp
- QR code (optional, for Phase 5 - verification URL)

#### PDF Styles:

```javascript
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansDevanagari',
    fontSize: 10,
    backgroundColor: '#FFF9C4',
  },
  container: {
    border: '2pt solid #333',
    padding: 20,
    flex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
    borderBottom: '1pt solid #666',
    paddingBottom: 10,
  },
  orgName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  branchName: {
    fontSize: 11,
    marginBottom: 8,
  },
  gatePassType: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    color: '#333',
    marginRight: 5,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    borderBottom: '1pt solid #999',
    flex: 1,
    paddingBottom: 2,
  },
  // Material table styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5E6A3',
    borderTop: '1pt solid #333',
    borderBottom: '1pt solid #333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #999',
    minHeight: 25,
  },
  tableCell: {
    padding: 4,
    borderRight: '0.5pt solid #999',
    fontSize: 9,
  },
  // Signature section
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 10,
  },
  signatureBlock: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1pt solid #333',
    marginTop: 40,
    paddingTop: 5,
  },
});
```

### Step 2: Font Setup for Marathi/Devanagari

**Critical**: The PDF must support Devanagari script for Marathi text.

1. Download **Noto Sans Devanagari** font files (Regular + Bold)
2. Place in `public/fonts/` directory
3. Register with `@react-pdf/renderer`

```javascript
Font.register({
  family: 'NotoSansDevanagari',
  fonts: [
    {
      src: '/fonts/NotoSansDevanagari-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/NotoSansDevanagari-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});
```

**Fallback approach**: If Devanagari fonts cause issues, use a bilingual approach:
- Labels in Marathi (using the Devanagari font)
- Values in English (using default font)
- This matches the physical form which has printed Marathi labels + handwritten English values

### Step 3: PDF Generation Service (`lib/pdfService.js`)

```javascript
import { pdf } from '@react-pdf/renderer';
import { GatePassPDF } from '@/components/gatepass/GatePassPDF';

export async function generateGatePassPDF(gatePassData) {
  const blob = await pdf(<GatePassPDF data={gatePassData} />).toBlob();
  return blob;
}

export function downloadGatePassPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getGatePassFilename(gatePass) {
  return `MSEB_GatePass_${gatePass.serial_number}_${gatePass.type}_${gatePass.date}.pdf`;
}
```

### Step 4: PDF Preview Component (`components/gatepass/GatePassPreview.jsx`)

A web-based preview that shows how the PDF will look, rendered as HTML/CSS (not the actual PDF renderer).

```javascript
// This renders a web-based preview of the gate pass
// Uses the same layout as the PDF but rendered as HTML
// Displayed in the gate pass detail page and as a print preview

export function GatePassPreview({ data }) {
  return (
    <div className="gatepass-preview">
      {/* Mirrors the PDF layout using CSS */}
      {/* Yellow background, bordered container */}
      {/* All the same sections as the PDF */}
    </div>
  );
}
```

**Preview Styles (in globals.css):**
```css
.gatepass-preview {
  background: #FFF9C4;
  border: 2px solid #333;
  padding: 30px;
  max-width: 210mm;  /* A4 width */
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  box-shadow: var(--shadow-xl);
}

.gatepass-preview .header {
  text-align: center;
  border-bottom: 1px solid #666;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.gatepass-preview .material-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.gatepass-preview .material-table th,
.gatepass-preview .material-table td {
  border: 1px solid #666;
  padding: 6px 8px;
  font-size: 0.85rem;
}

.gatepass-preview .material-table th {
  background: #F5E6A3;
  font-weight: 600;
}

@media print {
  .gatepass-preview {
    box-shadow: none;
    border: 2px solid #000;
  }
  .no-print { display: none; }
}
```

### Step 5: Add PDF Actions to Gate Pass Detail Page

Update `gatepass/[id]/page.js` to include:

1. **Preview Tab**: Show the web-based gate pass preview
2. **Download PDF Button**: Generate and download the PDF
3. **Print Button**: Open browser print dialog with the preview
4. **Share Buttons**: (Placeholder for Phase 5)

```javascript
// Action bar at top of detail page
<div className="action-bar">
  <Button 
    variant="primary" 
    icon={<Download />} 
    onClick={handleDownloadPDF}
    loading={generating}
  >
    Download PDF
  </Button>
  
  <Button 
    variant="secondary" 
    icon={<Printer />} 
    onClick={handlePrint}
  >
    Print
  </Button>
  
  <Button 
    variant="outline" 
    icon={<Share2 />} 
    onClick={() => setShareModalOpen(true)}
  >
    Share
  </Button>
</div>
```

### Step 6: Print Stylesheet

Add print-specific CSS to `globals.css`:

```css
@media print {
  /* Hide everything except the gate pass preview */
  body > *:not(.print-container) {
    display: none !important;
  }
  
  .sidebar,
  .header,
  .mobile-nav,
  .action-bar,
  .no-print {
    display: none !important;
  }
  
  .print-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  
  .gatepass-preview {
    box-shadow: none;
    margin: 0;
    padding: 15mm;
    border: 2px solid #000;
    page-break-inside: avoid;
  }
  
  @page {
    size: A4;
    margin: 10mm;
  }
}
```

### Step 7: Batch PDF Generation

For cases where admin needs to print multiple gate passes:

```javascript
// lib/pdfService.js

export async function generateBatchPDF(gatePasses) {
  // Generate a single PDF with multiple pages
  // Each gate pass on its own page
  const blob = await pdf(
    <Document>
      {gatePasses.map((gp, index) => (
        <GatePassPDFPage key={index} data={gp} />
      ))}
    </Document>
  ).toBlob();
  return blob;
}
```

### Step 8: PDF Customization Options

Add a settings section (stored in localStorage) for PDF customization:

```javascript
const pdfSettings = {
  organizationName: "महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्या.",
  branchName: "गाळण शाखा-दोंडाईचा जि.धुळे",
  contractorName: "M/S Standard Electrotech Service",
  defaultRemarks: "वरील सर्व रोहित्र तपासुन बघीतले...",
  showDigitalId: true,
  showTimestamp: true,
  backgroundColor: "#FFF9C4",  // Yellow like original
};
```

---

## 🖼️ Visual Reference

### PDF Output Should Look Like:

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्या.                ║
║       गाळण शाखा-दोंडाईचा जि.धुळे                            ║
║                                                              ║
║           ═══ गेट पास (जावक) ═══                             ║
║                                                              ║
║  क्रमांक: 164                        दिनांक: 21-07-2026       ║
║  ─────────────────────────────────────────────────────────   ║
║  प्रती:    Assistant Engineer, Virdel Section                ║
║            Shindkheda S/dn                                   ║
║  गाडी नं.: MH02 680689                                       ║
║  चालक:    Manoj Pawra (9876543210)                           ║
║  ठेकेदार:  M/S Standard Electrotech Service                  ║
║                                                              ║
║      ✻ मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन ✻               ║
║  ┌────┬─────┬──────┬───────┬──────┬───────────┬─────┐       ║
║  │अ.नं│ मेक │ सि.नं│जॉब नं.│क्षमता│गाव/ग्रूप नं│ शेरा │       ║
║  ├────┼─────┼──────┼───────┼──────┼───────────┼─────┤       ║
║  │ 1  │ SVJ │ 845  │FV-401 │63KVA│Chaugaon   │     │       ║
║  │    │     │ 1491 │       │     │DTC:4221318│     │       ║
║  └────┴─────┴──────┴───────┴──────┴───────────┴─────┘       ║
║                                                              ║
║  Line Staff: Rohit Salunkhe                                  ║
║  Mob: 9427166630  |  CPF: 2645050                           ║
║                                                              ║
║  टिपणी: वरील सर्व रोहित्र तपासुन बघीतले त्यांचे LT व      ║
║  HT Rods सुस्थितीत आहेत. तसेच रोहित्रामाधुन Oil            ║
║  Leakage नाही.                                              ║
║                                                              ║
║  देणाऱ्याची सही व हुद्दा         घेणाऱ्याची सही व हुद्दा      ║
║                                                              ║
║  ___________________         ___________________            ║
║                                                              ║
║  ─────────────────────────────────────────────────────────   ║
║  GP-2026-0164 | Generated: 21 Jul 2026, 14:00 IST           ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✅ Phase 3 Completion Checklist

- [ ] Noto Sans Devanagari fonts downloaded and registered
- [ ] `GatePassPDF.jsx` component renders complete A4 PDF
- [ ] PDF has yellow background matching physical form
- [ ] All gate pass fields rendered correctly in PDF
- [ ] Material table with proper borders and alignment
- [ ] Marathi labels + English/Marathi values
- [ ] Signature sections at bottom
- [ ] Digital ID and timestamp in footer
- [ ] `pdfService.js` with generate, download, filename helpers
- [ ] Web-based preview component (`GatePassPreview.jsx`)
- [ ] Download PDF button on gate pass detail page
- [ ] Print button with print stylesheet
- [ ] Print stylesheet hides UI, shows only gate pass
- [ ] Batch PDF generation for multiple passes
- [ ] PDF looks correct on both screen and printed paper
- [ ] PDF customization settings (organization name, branch, etc.)

---

## 🤖 Structured Prompt for Phase 3

```
You are building Phase 3 of the MSEB Digital Gate Pass System. Phases 1-2 are complete (project setup, design system, data models, CRUD operations).

PROJECT: MSEB Digital Gate Pass System  
PHASE: 3 - PDF Generation & Digital Gate Pass

CONTEXT: The physical gate pass is a yellow paper form used by MSEB for transformer transport. The PDF must closely replicate this form's appearance for familiarity and official acceptance.

TASK: Create PDF generation and web preview for gate passes.

REQUIREMENTS:

1. FONT SETUP:
   - Download Noto Sans Devanagari font (Regular + Bold) for Marathi text support
   - Place in public/fonts/ directory
   - Register with @react-pdf/renderer Font.register()
   - Fallback: Use bilingual approach (Marathi labels, English values)

2. PDF TEMPLATE (components/gatepass/GatePassPDF.jsx):
   Using @react-pdf/renderer, create an A4 PDF that replicates the physical yellow gate pass:
   - Page: A4 size, 40pt margins, light yellow (#FFF9C4) background
   - Container: 2pt solid border around all content
   - Header: Organization name in Marathi (महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्या.), branch name, gate pass type (जावक/आवक)
   - Info row: Serial number left, date right
   - Field rows: Recipient (प्रती), vehicle number (गाडी नं.), driver name, contractor name — each with Marathi label and underlined value
   - Material table: Bordered table with columns - अ.नं., मेक, सि.नं., जॉब नं., क्षमता, गावाचे नांव ग्रूप नं., शेरा. Header row with darker yellow background
   - Line staff section: Name, mobile, CPF
   - Remarks section: Full width Marathi text
   - Signature section: Two columns at bottom — sender (देणाऱ्याची सही) left, receiver (घेणाऱ्याची सही) right, with underlines for signatures
   - Footer: Digital gate pass ID (GP-YYYY-XXXX) and generation timestamp

3. PDF SERVICE (lib/pdfService.js):
   - generateGatePassPDF(data) → returns Blob
   - downloadGatePassPDF(blob, filename) → triggers download
   - getGatePassFilename(gatePass) → returns formatted filename
   - generateBatchPDF(gatePasses[]) → multi-page PDF

4. WEB PREVIEW (components/gatepass/GatePassPreview.jsx):
   - HTML/CSS version of the gate pass that looks identical to the PDF
   - Yellow background, bordered, A4-proportioned
   - Used on the gate pass detail page
   - Print-friendly (CSS @media print)

5. PRINT SUPPORT:
   - Print stylesheet in globals.css
   - Hides sidebar, header, nav, action buttons when printing
   - Shows only the gate pass preview
   - @page set to A4 size

6. INTEGRATION:
   - Add "Download PDF" button to gate pass detail page
   - Add "Print" button that opens browser print dialog
   - Add preview tab/section on detail page
   - Loading state while PDF generates

VISUAL DIRECTION:
- The PDF should feel OFFICIAL — like a digitized government form
- Yellow background (#FFF9C4) matches the physical yellow paper
- Marathi text for labels, values in English or Marathi as entered
- Clean borders, proper alignment, professional typography
- Footer should give it credibility as a digital document

OUTPUT: Complete PDF generation system with download, print, and web preview capabilities. The PDF should look close enough to the original form that MSEB officials immediately recognize it.
```

---

## 🚀 Next Phase

After Phase 3 is complete, proceed to **Phase 4: Dashboard, Analytics & Excel Export** where you'll build the admin dashboard with statistics, charts, and data export functionality.
