import { authAPI } from './api';

export const AUTH_USER_KEY = 'mseb_user';
export const ACCESS_TOKEN_KEY = 'mseb_access_token';
export const REFRESH_TOKEN_KEY = 'mseb_refresh_token';

export function getAuthUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(AUTH_USER_KEY);
  if (!data) return null;
  try {
    const user = JSON.parse(data);
    if (user && (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0)) {
      user.roles = user.role ? [user.role] : ['super_admin', 'admin', 'gate_pass_creator'];
    }
    return user;
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setSession(user, accessToken, refreshToken) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  // Set cookie for Next.js middleware check
  document.cookie = `mseb_auth_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
}

export async function loginWithPassword(identifier, password) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  const response = await authAPI.login(identifier, password);
  if (response && response.success) {
    const { user, accessToken, refreshToken } = response.data;
    setSession(user, accessToken, refreshToken);
    return user;
  }
  throw new Error(response?.message || 'Login failed');
}

export async function requestOTP(mobile) {
  const response = await authAPI.requestOTP(mobile);
  if (response && response.success) {
    return response.data;
  }
  throw new Error(response?.message || 'Failed to send OTP');
}

export async function verifyOTP(mobile, otp) {
  const response = await authAPI.verifyOTP(mobile, otp);
  if (response && response.success) {
    const { user, accessToken, refreshToken } = response.data;
    setSession(user, accessToken, refreshToken);
    return user;
  }
  throw new Error(response?.message || 'Invalid OTP');
}

export async function logoutUser() {
  try {
    await authAPI.logout();
  } catch (e) {
    console.warn('Logout API error:', e);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      document.cookie = 'mseb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}

export async function lookupCPF(cpfNumber) {
  const response = await authAPI.lookupCPF(cpfNumber);
  if (response && response.success) {
    return response.data;
  }
  throw new Error(response?.message || 'Official not found');
}

// Role & Permission Helpers
export function getUserRoles(user) {
  if (!user) return ['super_admin', 'admin', 'gate_pass_creator'];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (user.role) return [user.role];
  return ['gate_pass_viewer'];
}

export function hasRole(user, role) {
  const roles = getUserRoles(user);
  return roles.includes(role);
}

export function hasAnyRole(user, roles = []) {
  const userRoles = getUserRoles(user);
  return roles.some(r => userRoles.includes(r));
}

export function canCreateGatePass(user) {
  return hasAnyRole(user, ['super_admin', 'admin', 'gate_pass_creator']);
}

export function canEditGatePass(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canManageContractors(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canManageStations(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canManageUsers(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canManageAssets(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}

export function canViewAuditTrail(user) {
  return hasAnyRole(user, ['super_admin', 'admin']);
}
