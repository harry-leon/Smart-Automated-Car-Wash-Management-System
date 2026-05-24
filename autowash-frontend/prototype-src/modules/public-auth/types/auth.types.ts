export type Role = "customer" | "admin" | "staff";

export interface MockUser {
  id: string;
  fullName: string;
  emailOrPhone: string;
  password: string;
  role: Role;
  membershipTier: "Member" | "Silver" | "Gold" | "Platinum";
  availablePoints: number;
  lifetimePoints: number;
}

export interface RegisterPayload {
  fullName: string;
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
}
