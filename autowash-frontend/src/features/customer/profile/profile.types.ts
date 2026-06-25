import type { LoyaltyTier, UserRole, UserStatus } from "@/features/auth/auth.types";

export type UserPreferenceLanguage = "VI" | "EN";
export type UserPreferenceTheme = "LIGHT" | "DARK";

export type UserPreferences = {
  userId: string;
  language: UserPreferenceLanguage;
  theme: UserPreferenceTheme;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export type UserProfile = {
  userId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: UserStatus;
  role: UserRole;
  tier: LoyaltyTier | null;
  hasGoogleAuth: boolean;
  isNewCustomer: boolean;
  loyaltyBalance: number;
  registeredAt: string;
  preferences: UserPreferences;
};

export type UpdateUserProfileRequest = {
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type UpdateUserProfileResponse = {
  userId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  updatedAt: string;
};
