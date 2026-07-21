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

export const GATEPASS_STATUS_CONFIG = {
  [GATEPASS_STATUS.DRAFT]: { label: 'Draft', marathiLabel: 'मसुदा', badgeVariant: 'neutral' },
  [GATEPASS_STATUS.ISSUED]: { label: 'Issued', marathiLabel: 'निर्गमित', badgeVariant: 'info' },
  [GATEPASS_STATUS.IN_TRANSIT]: { label: 'In Transit', marathiLabel: 'मार्गावर (जावक)', badgeVariant: 'warning' },
  [GATEPASS_STATUS.DELIVERED]: { label: 'Delivered', marathiLabel: 'पोहोचले', badgeVariant: 'success' },
  [GATEPASS_STATUS.RETURN_ISSUED]: { label: 'Return Issued', marathiLabel: 'परतावा निर्गमित', badgeVariant: 'info' },
  [GATEPASS_STATUS.RETURN_IN_TRANSIT]: { label: 'Return In Transit', marathiLabel: 'मार्गावर (आवक)', badgeVariant: 'warning' },
  [GATEPASS_STATUS.COMPLETED]: { label: 'Completed', marathiLabel: 'पूर्ण', badgeVariant: 'success' },
  [GATEPASS_STATUS.CANCELLED]: { label: 'Cancelled', marathiLabel: 'रद्द', badgeVariant: 'danger' },
};

export const GATEPASS_TYPE = {
  OUTWARD: 'outward',   // जावक - Sending transformer out
  INWARD: 'inward'      // आवक - Receiving transformer back
};

export const GATEPASS_TYPE_CONFIG = {
  [GATEPASS_TYPE.OUTWARD]: { label: 'Outward (जावक)', color: 'blue' },
  [GATEPASS_TYPE.INWARD]: { label: 'Inward (आवक)', color: 'amber' },
};

export const TRANSFORMER_CAPACITY = [
  '10 KVA',
  '16 KVA',
  '25 KVA',
  '63 KVA',
  '100 KVA',
  '200 KVA',
  '315 KVA',
  '500 KVA'
];

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Gate Passes', href: '/gatepass', icon: 'FileText' },
  { label: 'New Gate Pass', href: '/gatepass/new', icon: 'PlusCircle' },
  { label: 'Drivers', href: '/drivers', icon: 'Users' },
  { label: 'Substations', href: '/substations', icon: 'Building2' },
  { label: 'Export Data', href: '/export', icon: 'Download' },
];

export const APP_INFO = {
  name: 'MSEB GatePass',
  fullName: 'MSEB Gate Pass Management System',
  subdivision: 'Sub Division Dondaicha',
  contractor: 'Rupesh Transport Services',
  contactEmail: 'support@mseb-gatepass.com'
};
