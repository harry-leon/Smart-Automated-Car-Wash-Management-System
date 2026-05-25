export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED";
export type LoyaltyTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM";

export type RegisterRequest = {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  passwordConfirm: string;
};

export type RegisterResponseData = {
  userId: string;
  phone: string;
  fullName: string;
  email?: string;
  status: "PENDING";
  requiresOtpVerification: boolean;
  otpExpiresIn: number;
};

export type LoginRequest = {
  phone: string;
  password: string;
  rememberMe?: boolean;
};

export type SendOtpRequest = {
  phone: string;
};

export type SendOtpResponseData = {
  phone: string;
  otpExpiresIn: number;
  maskedPhone?: string;
  message?: string;
};

export type VerifyOtpRequest = {
  phone: string;
  otp: string;
};

export type AuthResponseData = {
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  tier?: LoyaltyTier;
  loyaltyBalance?: number;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

export type LoginResponseData = AuthResponseData;
export type VerifyOtpResponseData = AuthResponseData;

export type LogoutRequest = {
  refreshToken?: string | null;
};

export type AuthUser = {
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  tier: LoyaltyTier | null;
  loyaltyBalance: number | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  user: AuthUser;
};
