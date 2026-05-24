import type { MockUser } from "../types/auth.types";

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    fullName: "Nguyen Van A",
    emailOrPhone: "customer@aura.vn",
    password: "password123",
    role: "customer",
    membershipTier: "Member",
    availablePoints: 0,
    lifetimePoints: 0,
  },
  {
    id: "u2",
    fullName: "Admin User",
    emailOrPhone: "admin@aura.vn",
    password: "admin123",
    role: "admin",
    membershipTier: "Member",
    availablePoints: 0,
    lifetimePoints: 0,
  },
  {
    id: "u3",
    fullName: "Staff Member",
    emailOrPhone: "staff@aura.vn",
    password: "staff123",
    role: "staff",
    membershipTier: "Member",
    availablePoints: 0,
    lifetimePoints: 0,
  },
];

export const ROLE_REDIRECT: Record<string, string> = {
  customer: "/customer/home",
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
};

export function mockLogin(emailOrPhone: string, password: string): MockUser | null {
  return MOCK_USERS.find((u) => u.emailOrPhone === emailOrPhone && u.password === password) ?? null;
}
