export const GATEPASS_STATUS = {
  ISSUED: 'issued',
  CREDITED: 'credited',
  COMPLETED: 'completed',
};

export const GATEPASS_STATUS_CONFIG = {
  [GATEPASS_STATUS.ISSUED]: { label: 'Issued', marathiLabel: 'वितरीत (Issued)', badgeVariant: 'info', color: 'blue' },
  [GATEPASS_STATUS.CREDITED]: { label: 'Credited', marathiLabel: 'जमा (Credited)', badgeVariant: 'warning', color: 'amber' },
  [GATEPASS_STATUS.COMPLETED]: { label: 'Completed', marathiLabel: 'पूर्ण (Completed)', badgeVariant: 'success', color: 'emerald' },
};

export const GATEPASS_TYPE = {
  OUTWARD: 'outward',
  INWARD: 'inward',
};

export const GATEPASS_TYPE_CONFIG = {
  [GATEPASS_TYPE.OUTWARD]: { label: 'Outward (जावक)', color: 'blue' },
  [GATEPASS_TYPE.INWARD]: { label: 'Inward (आवक)', color: 'amber' },
};

export const WARRANTY_STATUS = {
  GP: 'GP',
  FRESH: 'FRESH',
};

export const ASSET_PHASE = {
  SINGLE: 'SINGLE',
  THREE: 'THREE',
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
  { label: 'Assets', href: '/assets', icon: 'Zap' },
  { label: 'Contractors', href: '/contractors', icon: 'Truck' },
  { label: 'Substations', href: '/substations', icon: 'Building2' },
  { label: 'Users', href: '/users', icon: 'Users' },
  { label: 'Export Data', href: '/export', icon: 'Download' },
];

export const APP_INFO = {
  name: 'MSEB GatePass',
  fullName: 'MSEB Gate Pass Management System',
  subdivision: 'Sub Division Dondaicha',
  contractor: 'MSEB Transport & Operations',
  contactEmail: 'support@mseb-gatepass.com'
};
