import type {
  AuthResponseData,
  AuthSession,
  UserRole,
} from "../types/auth.types.ts";

const AUTH_REDIRECT_PATH: Record<UserRole, string> = {
  CUSTOMER: "/customer/home",
  STAFF: "/staff/dashboard",
  ADMIN: "/admin/dashboard",
};

export function getAuthRedirectPath(role: UserRole) {
  return AUTH_REDIRECT_PATH[role];
}

export function isCustomerRole(role: UserRole) {
  return role === "CUSTOMER";
}

export function buildAuthSession(data: AuthResponseData): AuthSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
    expiresIn: data.expiresIn,
    user: {
      userId: data.userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email ?? null,
      role: data.role,
      status: data.status,
      tier: data.tier ?? null,
      loyaltyBalance: data.loyaltyBalance ?? null,
    },
  };
}
