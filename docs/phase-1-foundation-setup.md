# Phase 1: Foundation & Project Setup

## 🎯 Objective

Set up the Next.js project with a complete design system, layout structure, and core configuration. This phase creates the skeleton upon which all features are built. No business logic — only infrastructure, theming, and navigation.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- VS Code or preferred editor
- Git initialized

---

## 🏗️ Tech Stack Decisions

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | Full-stack React framework |
| React | 19 | UI library |
| Supabase JS | @supabase/supabase-js v2 | Database + Auth client |
| Lucide React | latest | Icon library (lightweight, tree-shakeable) |
| @react-pdf/renderer | latest | PDF generation (install now, use in Phase 3) |
| xlsx (SheetJS) | latest | Excel export (install now, use in Phase 4) |
| date-fns | latest | Date formatting & manipulation |
| react-hot-toast | latest | Toast notifications |
| Resend | latest | Email sending (install now, use in Phase 5) |

---

## 📁 Folder Structure

```
mseb-gatepass/
├── public/
│   ├── mseb-logo.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout with sidebar
│   │   ├── page.js                # Dashboard home (redirect or overview)
│   │   ├── globals.css            # Design system + global styles
│   │   ├── dashboard/
│   │   │   └── page.js            # Main dashboard (Phase 4)
│   │   ├── gatepass/
│   │   │   ├── page.js            # List all gate passes
│   │   │   ├── new/
│   │   │   │   └── page.js        # Create new gate pass form
│   │   │   └── [id]/
│   │   │       ├── page.js        # View single gate pass
│   │   │       └── edit/
│   │   │           └── page.js    # Edit gate pass
│   │   ├── drivers/
│   │   │   └── page.js            # Manage drivers (Phase 2)
│   │   ├── substations/
│   │   │   └── page.js            # Manage substations (Phase 2)
│   │   ├── export/
│   │   │   └── page.js            # Excel export page (Phase 4)
│   │   ├── login/
│   │   │   └── page.js            # Login page (Phase 6)
│   │   └── api/
│   │       ├── gatepass/
│   │       │   └── route.js       # Gate pass API routes
│   │       ├── share/
│   │       │   └── route.js       # Sharing API (Phase 5)
│   │       └── export/
│   │           └── route.js       # Export API (Phase 4)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx        # Main sidebar navigation
│   │   │   ├── Header.jsx         # Top header bar
│   │   │   ├── MobileNav.jsx      # Mobile bottom navigation
│   │   │   └── PageWrapper.jsx    # Page content wrapper
│   │   ├── ui/
│   │   │   ├── Button.jsx         # Reusable button component
│   │   │   ├── Input.jsx          # Form input component
│   │   │   ├── Select.jsx         # Dropdown select
│   │   │   ├── Badge.jsx          # Status badges
│   │   │   ├── Card.jsx           # Card container
│   │   │   ├── Modal.jsx          # Modal dialog
│   │   │   ├── Table.jsx          # Data table component
│   │   │   ├── EmptyState.jsx     # Empty state placeholder
│   │   │   └── Loader.jsx         # Loading spinner/skeleton
│   │   ├── gatepass/
│   │   │   ├── GatePassForm.jsx   # Create/Edit form (Phase 2)
│   │   │   ├── GatePassCard.jsx   # Card view of gate pass
│   │   │   ├── GatePassTable.jsx  # Table view of gate passes
│   │   │   ├── GatePassPDF.jsx    # PDF template (Phase 3)
│   │   │   └── StatusTimeline.jsx # Status tracking timeline
│   │   └── dashboard/
│   │       ├── StatsCard.jsx      # Dashboard stat card (Phase 4)
│   │       ├── RecentPasses.jsx   # Recent gate passes widget
│   │       └── Charts.jsx         # Simple charts (Phase 4)
│   ├── lib/
│   │   ├── supabase.js            # Supabase client config
│   │   ├── constants.js           # App-wide constants
│   │   ├── utils.js               # Utility functions
│   │   └── validators.js          # Form validation helpers
│   ├── hooks/
│   │   ├── useGatePass.js         # Gate pass CRUD hook
│   │   ├── useDrivers.js          # Drivers data hook
│   │   └── useExport.js           # Export functionality hook
│   └── store/
│       └── gatepassStore.js       # Local state management (Phase 1: localStorage, Phase 6: Supabase)
├── .env.local                      # Environment variables
├── next.config.js
├── package.json
└── README.md
```

---

## 🎨 Design System

### Color Palette

The design should feel **professional and government-friendly** while being modern. Inspired by the yellow gate pass + MSEB branding.

```css
/* Primary - Deep MSEB Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-900: #1e3a5f;

/* Accent - MSEB Yellow/Amber (from the gate pass paper) */
--accent-50: #fffbeb;
--accent-100: #fef3c7;
--accent-400: #fbbf24;
--accent-500: #f59e0b;
--accent-600: #d97706;

/* Success / In Transit / Completed */
--success-500: #22c55e;
--warning-500: #f59e0b;
--danger-500: #ef4444;

/* Neutrals */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;
```

### Typography

```css
/* Font: Inter from Google Fonts */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px - Labels, helper text */
--text-sm: 0.875rem;   /* 14px - Secondary text, table cells */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subtitles */
--text-xl: 1.25rem;    /* 20px - Section headers */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Hero text */
```

### Spacing & Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
```

---

## 📝 Implementation Steps

### Step 1: Initialize Next.js Project

```bash
npx -y create-next-app@latest ./ --js --app --eslint --no-tailwind --src-dir --no-turbopack --import-alias "@/*"
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js lucide-react date-fns react-hot-toast
npm install @react-pdf/renderer xlsx resend
```

### Step 3: Create Design System (`globals.css`)

Implement the complete CSS design system with:
- CSS custom properties (all tokens above)
- Reset & base styles
- Utility classes for common patterns
- Component-level styles (buttons, inputs, cards, badges, tables)
- Layout styles (sidebar, header, page wrapper)
- Responsive breakpoints (mobile-first)
- Animations (fade-in, slide-in, pulse, skeleton loading)
- Dark mode support (optional for MVP, but set up the structure)

### Step 4: Build Layout Components

#### Sidebar (`Sidebar.jsx`)
- MSEB logo + app name at top
- Navigation links with icons:
  - 🏠 Dashboard
  - 📋 Gate Passes
  - ➕ New Gate Pass
  - 🚗 Drivers
  - 🏭 Substations
  - 📊 Export Data
- Active state highlighting
- Collapsible on tablet
- Hidden on mobile (use MobileNav instead)

#### Header (`Header.jsx`)
- Page title (dynamic based on route)
- Search bar (global search)
- Quick action button (+ New Gate Pass)
- User avatar/name dropdown
- Notification bell (future)

#### MobileNav (`MobileNav.jsx`)
- Bottom tab navigation for mobile
- 4-5 key navigation items with icons
- Active state indicator

#### PageWrapper (`PageWrapper.jsx`)
- Consistent padding and max-width
- Breadcrumb support
- Page title + description slot

### Step 5: Build Core UI Components

Build these reusable components with consistent styling:

#### Button.jsx
```
Props: variant (primary|secondary|outline|danger|ghost), size (sm|md|lg), icon, loading, disabled, fullWidth
```

#### Input.jsx
```
Props: label, placeholder, type, error, helperText, icon, required, disabled
Supports: text, number, date, tel, email
```

#### Select.jsx
```
Props: label, options, placeholder, error, required, multiple
```

#### Badge.jsx
```
Props: variant (success|warning|danger|info|neutral), size (sm|md), dot (boolean)
Usage: Gate pass status badges
```

#### Card.jsx
```
Props: padding, hover, onClick, className
Slots: header, body, footer
```

#### Modal.jsx
```
Props: isOpen, onClose, title, size (sm|md|lg|xl)
Slots: body, footer (action buttons)
Features: Backdrop click to close, ESC key, focus trap
```

#### Table.jsx
```
Props: columns, data, sortable, onSort, emptyMessage
Features: Responsive (cards on mobile), sortable headers, row click
```

#### EmptyState.jsx
```
Props: icon, title, description, actionLabel, onAction
Usage: When no gate passes, drivers, etc.
```

#### Loader.jsx
```
Variants: spinner, skeleton (for cards), skeleton-table (for table rows)
```

### Step 6: Create Placeholder Pages

Create all route pages with basic structure:
- Dashboard → "Coming in Phase 4"
- Gate Passes List → "Coming in Phase 2"
- New Gate Pass → "Coming in Phase 2"
- Drivers → "Coming in Phase 2"
- Substations → "Coming in Phase 2"
- Export → "Coming in Phase 4"
- Login → "Coming in Phase 6"

Each placeholder should use the layout and show the page title + an EmptyState component.

### Step 7: Configure Supabase

1. Create Supabase project at supabase.com
2. Add env variables to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```
3. Create `lib/supabase.js` client
4. Set up initial localStorage fallback in `store/gatepassStore.js`

### Step 8: Set up Constants

```javascript
// lib/constants.js
export const GATEPASS_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  RETURN_ISSUED: 'return_issued',
  RETURN_IN_TRANSIT: 'return_in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const GATEPASS_TYPE = {
  OUTWARD: 'outward',   // जावक - Sending transformer out
  INWARD: 'inward'      // आवक - Receiving transformer back
};

export const TRANSFORMER_CAPACITY = [
  '10 KVA', '16 KVA', '25 KVA', '63 KVA',
  '100 KVA', '200 KVA', '315 KVA', '500 KVA'
];

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Gate Passes', href: '/gatepass', icon: 'FileText' },
  { label: 'New Gate Pass', href: '/gatepass/new', icon: 'PlusCircle' },
  { label: 'Drivers', href: '/drivers', icon: 'Users' },
  { label: 'Substations', href: '/substations', icon: 'Building2' },
  { label: 'Export Data', href: '/export', icon: 'Download' },
];
```

---

## ✅ Phase 1 Completion Checklist

- [ ] Next.js project initialized and running on `localhost:3000`
- [ ] All dependencies installed
- [ ] `globals.css` design system complete with all tokens
- [ ] Sidebar navigation working with active states
- [ ] Header component with dynamic page title
- [ ] Mobile bottom navigation
- [ ] All 8 UI components built (Button, Input, Select, Badge, Card, Modal, Table, Loader)
- [ ] All placeholder pages created with proper routing
- [ ] Supabase client configured (or localStorage fallback ready)
- [ ] Constants file with all enums
- [ ] App is responsive (mobile, tablet, desktop)
- [ ] Smooth page transitions and micro-animations
- [ ] Inter font loaded from Google Fonts

---

## 🤖 Structured Prompt for Phase 1

Use this prompt to instruct an AI assistant or as your implementation guide:

```
You are building a digital gate pass management system for MSEB (Maharashtra State Electricity Distribution Company). This is Phase 1: Foundation & Setup.

PROJECT: MSEB Digital Gate Pass System
CONTEXT: Replaces paper-based gate passes used for transformer transport between substations. Admin at Dondaicha MSEB office creates digital gate passes for contractor Rupesh's drivers.

TASK: Set up the complete Next.js project foundation.

REQUIREMENTS:
1. Initialize Next.js 15 with App Router, JavaScript, src directory, no Tailwind
2. Install: @supabase/supabase-js, lucide-react, date-fns, react-hot-toast, @react-pdf/renderer, xlsx, resend
3. Create a comprehensive CSS design system in globals.css with:
   - CSS variables for colors (MSEB blue primary, amber accent from yellow gate pass paper)
   - Typography scale using Inter font
   - Spacing, radius, shadow tokens
   - Base element styles
   - Component styles (buttons, inputs, cards, badges, tables)
   - Layout styles (sidebar 260px, header 64px, responsive grid)
   - Animations (fadeIn, slideIn, shimmer for skeleton loading)
4. Build layout components:
   - Sidebar.jsx: Logo, nav links with lucide icons, active state, collapsible
   - Header.jsx: Page title, search, quick action button, user area
   - MobileNav.jsx: Bottom tab bar for mobile (shown below 768px)
   - PageWrapper.jsx: Consistent page padding and max-width
5. Build reusable UI components:
   - Button (variants: primary, secondary, outline, danger, ghost; sizes: sm, md, lg; loading state)
   - Input (label, error state, helper text, icon support)
   - Select (label, options array, error state)
   - Badge (variants: success, warning, danger, info, neutral)
   - Card (hover effect, click handler, header/body/footer slots)
   - Modal (open/close, backdrop, ESC key, sizes)
   - Table (columns config, sortable, responsive card view on mobile)
   - EmptyState (icon, title, description, action button)
   - Loader (spinner and skeleton variants)
6. Create placeholder pages for all routes with EmptyState components
7. Set up lib/constants.js with gate pass statuses, types, transformer capacities
8. Set up lib/supabase.js with client configuration
9. Create store/gatepassStore.js with localStorage-based state management

DESIGN DIRECTION:
- Professional, clean, government-appropriate
- Primary: Deep blue (#1e3a5f to #3b82f6)
- Accent: Amber/Yellow (#f59e0b) — inspired by the physical yellow gate pass paper
- Dark sidebar with light content area
- Smooth transitions and hover effects
- Mobile-first responsive design

GATE PASS STATUSES:
draft → issued → in_transit → delivered → return_issued → return_in_transit → completed
(also: cancelled)

GATE PASS TYPES:
- Outward (जावक) — sending transformer from depot
- Inward (आवक) — receiving transformer back

OUTPUT: Complete working Next.js application skeleton with all components, routing, and design system. The app should look polished even with placeholder content.
```

---

## 🚀 Next Phase

After Phase 1 is complete, proceed to **Phase 2: Data Models & Gate Pass CRUD** where you'll build the gate pass form, driver management, and core data operations.
