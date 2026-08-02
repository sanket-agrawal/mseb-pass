const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mseb_access_token');
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('mseb_access_token', accessToken);
  localStorage.setItem('mseb_refresh_token', refreshToken);
  if (typeof window !== 'undefined') {
    document.cookie = `mseb_auth_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
  }
}

function clearTokens() {
  localStorage.removeItem('mseb_access_token');
  localStorage.removeItem('mseb_refresh_token');
  localStorage.removeItem('mseb_user');
  if (typeof window !== 'undefined') {
    document.cookie = 'mseb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      (config.headers as any).Authorization = `Bearer ${getToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, config);
      if (!retryRes.ok) throw await parseError(retryRes);
      return retryRes.json();
    }
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) throw await parseError(res);
  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('mseb_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setTokens(data.data.accessToken, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function parseError(res: Response): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.message || 'Request failed');
  } catch {
    return new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
}

// ─── Auth API ───────────────────────────────────
export const authAPI = {
  login: (identifier: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),

  requestOTP: (mobile: string) =>
    request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ mobile }) }),

  verifyOTP: (mobile: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ mobile, otp }) }),

  me: () => request('/auth/me'),

  logout: () => request('/auth/logout', { method: 'POST' }),

  lookupCPF: (cpf: string) => request(`/auth/cpf/${cpf}`),

  changePassword: (current_password: string, new_password: string) =>
    request('/auth/password', { method: 'PATCH', body: JSON.stringify({ current_password, new_password }) }),
};

// ─── Gate Pass API ──────────────────────────────
export const gatePassAPI = {
  list: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request(`/gatepasses?${params}`);
  },

  get: (id: string) => request(`/gatepasses/${id}`),

  create: (data: any) =>
    request('/gatepasses', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: string, status: string, reason?: string) =>
    request(`/gatepasses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),

  addVehicle: (id: string, vehicleData: any) =>
    request(`/gatepasses/${id}/vehicle`, { method: 'PATCH', body: JSON.stringify(vehicleData) }),

  assignVendor: (id: string, vendorId: string) =>
    request(`/gatepasses/${id}/assign-vendor`, { method: 'PATCH', body: JSON.stringify({ vendor_id: vendorId }) }),

  getAudit: (id: string) => request(`/gatepasses/${id}/audit`),

  getPublic: (id: string) => request(`/gatepasses/public/${id}`),
};

// ─── Driver API ─────────────────────────────────
export const driverAPI = {
  list: (search?: string) => request(`/drivers${search ? `?search=${search}` : ''}`),
  create: (data: any) => request('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Office API ─────────────────────────────────
export const officeAPI = {
  list: () => request('/offices'),
  getTree: () => request('/offices/tree'),
  create: (data: any) => request('/offices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/offices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Asset API ──────────────────────────────────
export const assetAPI = {
  list: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request(`/assets?${params}`);
  },
  lookupDTC: (dtc: string) => request(`/assets/dtc/${dtc}`),
  create: (data: any) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  bulkImport: (assets: any[]) => request('/assets/bulk', { method: 'POST', body: JSON.stringify({ assets }) }),
};

// ─── User API ───────────────────────────────────
export const userAPI = {
  list: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request(`/users?${params}`);
  },
  create: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id: string) => request(`/users/${id}/deactivate`, { method: 'PATCH' }),
};

// ─── Dashboard API ──────────────────────────────
export const dashboardAPI = {
  stats: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    return request(`/dashboard/stats?${q}`);
  },
};

// ─── Export API ─────────────────────────────────
export const exportAPI = {
  excel: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    const token = getToken();
    const res = await fetch(`${API_BASE}/export/excel?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },
};

// ─── Share API ──────────────────────────────────
export const shareAPI = {
  share: (gatepassId: string, method: string, recipient: string) =>
    request(`/share/${gatepassId}`, {
      method: 'POST',
      body: JSON.stringify({ method, recipient }),
    }),

  history: (gatepassId: string) => request(`/share/${gatepassId}/notifications`),
};

// ─── Audit API ──────────────────────────────────
export const auditAPI = {
  list: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request(`/audit?${params}`);
  },
};
