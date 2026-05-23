export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "BLOCKED" | "SUSPENDED";
export type LoyaltyTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM";

export type LoginRequest = {
  phone: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResponseData = {
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

export type InternalRole = "staff" | "admin";

export type InternalLoginCredentials = {
  email: string;
  password: string;
};

export type InternalLoginResponseData = {
  userId?: string;
  id?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole | InternalRole | string;
  status?: UserStatus;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    name?: string;
    role?: UserRole | InternalRole | string;
  };
};

export type InternalAuthUser = {
  id?: string;
  email?: string;
  fullName?: string;
  role: InternalRole;
};

export type InternalAuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: InternalAuthUser;
};
