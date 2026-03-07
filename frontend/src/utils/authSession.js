export const AUTH_TOKEN_KEY = "saf_auth_token";
export const AUTH_USER_KEY = "saf_auth_user";
export const AUTH_EXPIRES_AT_KEY = "saf_auth_expires_at";

export function getStoredAuth() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const userRaw = localStorage.getItem(AUTH_USER_KEY);
    const expiresAt = Number(localStorage.getItem(AUTH_EXPIRES_AT_KEY) || 0);
    const user = userRaw ? JSON.parse(userRaw) : null;

    if (!token || !user || !expiresAt || Date.now() >= expiresAt) {
      clearAuthSession();
      return { isAuthenticated: false, token: "", user: null, expiresAt: 0 };
    }

    return { isAuthenticated: true, token, user, expiresAt };
  } catch {
    clearAuthSession();
    return { isAuthenticated: false, token: "", user: null, expiresAt: 0 };
  }
}

export function isAuthenticated() {
  return getStoredAuth().isAuthenticated;
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  } catch {
    return;
  }
}
