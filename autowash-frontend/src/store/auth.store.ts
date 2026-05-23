import { createStore } from "zustand/vanilla";
import { AuthSession, AuthUser } from "@/types/auth.types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AuthUser | null;
};

type AuthActions = {
  setSession: (session: AuthSession) => void;
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  clear: () => void;
};

type AuthStore = AuthState & AuthActions;

const authStore = createStore<AuthStore>()((set) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: Date.now() + session.expiresIn * 1000,
      user: session.user
    }),
  setAccessToken: (accessToken, expiresIn) =>
    set((state) => ({
      accessToken,
      refreshToken: state.refreshToken,
      expiresAt: Date.now() + expiresIn * 1000
    })),
  clear: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null
    })
}));

export function getAuthState() {
  return authStore.getState();
}

export function setAuthSession(session: AuthSession) {
  authStore.getState().setSession(session);
}

export function setAccessToken(accessToken: string, expiresIn: number) {
  authStore.getState().setAccessToken(accessToken, expiresIn);
}

export function clearAuthSession() {
  authStore.getState().clear();
}

export function getAccessToken() {
  return authStore.getState().accessToken;
}

export function getRefreshToken() {
  return authStore.getState().refreshToken;
}
