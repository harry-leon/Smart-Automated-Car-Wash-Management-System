import type { AuthSession, AuthUser } from "@/features/auth/auth.types";

const AUTH_SESSION_STORAGE_KEY = "autowash.auth.session";

export type PersistedAuthState = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  user: AuthUser;
};

export function serializeAuthState(session: AuthSession): string {
  return JSON.stringify({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: Date.now() + session.expiresIn * 1000,
    user: session.user,
  } satisfies PersistedAuthState);
}

export function deserializeAuthState(rawValue: string | null): PersistedAuthState | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedAuthState>;

    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !parsed.user
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? null,
      expiresAt: parsed.expiresAt,
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

export function readPersistedAuthState(): PersistedAuthState | null {
  if (typeof window === "undefined") {
    return null;
  }

  return deserializeAuthState(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));
}

export function writePersistedAuthState(state: PersistedAuthState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
