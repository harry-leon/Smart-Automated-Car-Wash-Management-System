import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { AuthSession, AuthUser } from "@/features/auth/auth.types";
import {
  clearPersistedAuthState,
  type PersistedAuthState,
  readPersistedAuthState,
  writePersistedAuthState,
} from "@/features/auth/lib/auth-session-storage";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AuthUser | null;
};

type AuthActions = {
  setSession: (session: AuthSession) => void;
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
};

type AuthStore = AuthState & AuthActions;

const persistedState = readPersistedAuthState();

const authStore = createStore<AuthStore>()((set, get) => ({
  accessToken: persistedState?.accessToken ?? null,
  refreshToken: persistedState?.refreshToken ?? null,
  expiresAt: persistedState?.expiresAt ?? null,
  user: persistedState?.user ?? null,
  setSession: (session) =>
    set(() => {
      const nextState = {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: Date.now() + session.expiresIn * 1000,
        user: session.user,
      };
      writePersistedAuthState(nextState);
      return nextState;
    }),
  setAccessToken: (accessToken, expiresIn) =>
    set(() => {
      const nextState = {
        ...get(),
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      if (!nextState.user || nextState.expiresAt === null) {
        clearPersistedAuthState();
        return nextState;
      }

      const persistedState = {
        accessToken,
        refreshToken: nextState.refreshToken,
        expiresAt: nextState.expiresAt,
        user: nextState.user,
      };

      writePersistedAuthState(persistedState);
      return nextState;
    }),
  setUser: (user) =>
    set(() => {
      const nextState = {
        ...get(),
        user,
      };
      if (!user || !nextState.accessToken || nextState.expiresAt === null) {
        clearPersistedAuthState();
        return nextState;
      }

      const persistedState: PersistedAuthState = {
        accessToken: nextState.accessToken,
        refreshToken: nextState.refreshToken,
        expiresAt: nextState.expiresAt,
        user,
      };

      writePersistedAuthState(persistedState);
      return nextState;
    }),
  clear: () =>
    set(() => {
      clearPersistedAuthState();
      return {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
      };
    }),
}));

export function useAuthStore<T>(selector: (state: AuthStore) => T) {
  return useStore(authStore, selector);
}

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

export function setAuthUser(user: AuthUser | null) {
  authStore.getState().setUser(user);
}

export function getAccessToken() {
  return authStore.getState().accessToken;
}

export function getRefreshToken() {
  return authStore.getState().refreshToken;
}
