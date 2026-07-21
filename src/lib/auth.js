export const AUTH_STORAGE_KEY = 'mseb_auth_user';

export function getAuthUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAuthUser();
}

export function loginUser(email, password) {
  // Demo admin credentials validation
  if (email.toLowerCase().trim() === 'admin@mseb.com' && password === 'admin123') {
    const user = {
      id: 'usr_admin_01',
      name: 'MSEB Admin',
      email: 'admin@mseb.com',
      role: 'admin',
      branch: 'Sub Division Dondaicha',
      division: 'Dhule Circle',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // Set auth cookie for middleware check
    document.cookie = `mseb_auth_token=valid_token; path=/; max-age=86400`;
    return user;
  }

  // Generic demo fallback login
  if (email && password && password.length >= 6) {
    const user = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: 'admin',
      branch: 'Sub Division Dondaicha',
      division: 'Dhule Circle',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    document.cookie = `mseb_auth_token=valid_token; path=/; max-age=86400`;
    return user;
  }

  throw new Error('Invalid email or password. Use admin@mseb.com / admin123 for demo login.');
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = 'mseb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
