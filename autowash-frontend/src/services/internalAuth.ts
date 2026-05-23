import type { InternalAuthSession, InternalLoginResponseData, InternalRole } from "@/types/auth.types";

const TOKEN_KEY = "autowash_internal_access_token";
const REFRESH_TOKEN_KEY = "autowash_internal_refresh_token";
const ROLE_KEY = "autowash_internal_role";
const USER_KEY = "autowash_internal_user";

export const AUTH_TOKEN_COOKIE = "autowash_internal_token";
export const AUTH_ROLE_COOKIE = "autowash_internal_role";

const COOKIE_MAX_AGE_SECONDS = 60 * 60;

function normalizeRole(role?: string): InternalRole | null {
  const normalized = role?.toLowerCase();
  if (normalized === "staff" || normalized === "admin") {
    return normalized;
  }
  return null;
}

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getInternalRole(): InternalRole | null {
  if (typeof window === "undefined") {
    return null;
  }
  return normalizeRole(window.localStorage.getItem(ROLE_KEY) ?? undefined);
}

export function isRoleAllowed(expectedRole: InternalRole) {
  return getAccessToken() !== null && getInternalRole() === expectedRole;
}

export function getAuthHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function toAuthSession(data: InternalLoginResponseData): InternalAuthSession {
  const accessToken = data.accessToken ?? data.token;
  const role = normalizeRole(data.user?.role ?? data.role);

  if (!accessToken || !role) {
    throw new Error("Login response did not include an internal token and role.");
  }

  return {
    accessToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.user?.id ?? data.user?.userId ?? data.id ?? data.userId,
      email: data.user?.email ?? data.email,
      fullName: data.user?.fullName ?? data.user?.name ?? data.fullName ?? data.name,
      role
    }
  };
}

export function saveInternalSession(session: InternalAuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(ROLE_KEY, session.user.role);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  setCookie(AUTH_TOKEN_COOKIE, session.accessToken);
  setCookie(AUTH_ROLE_COOKIE, session.user.role);

  if (session.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }
}

export function clearInternalSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(ROLE_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_ROLE_COOKIE);
}
