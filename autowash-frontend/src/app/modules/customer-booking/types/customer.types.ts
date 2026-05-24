export type MembershipTier = "Silver" | "Gold" | "Diamond";
export type CustomerLanguage = "en" | "vi";

export interface CustomerProfile {
  id: string;
  fullName: string;
  tier: MembershipTier;
  isNewCustomer: boolean;
  availablePoints: number;
  lifetimePoints: number;
}

export type ActiveComboStatus = "ACTIVE" | "EXPIRING_SOON" | "PAUSED";

export interface ActiveCombo {
  id: string;
  comboPackageId: string;
  comboName: string;
  status: ActiveComboStatus;
  remainingUses: number;
  totalUses: number;
  validUntil: string;
  linkedVehicleId: string;
  qrCodeText: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  highlights: string[];
  recommendedFor: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface ComboPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  totalUses: number;
  validityDays: number;
  savingsText: string;
  packageIds: string[];
}

export type VoucherSource =
  | "MANUAL"
  | "POINT_REDEEM"
  | "TIER_BENEFIT"
  | "NEW_CUSTOMER"
  | "CAMPAIGN";
export type VoucherStatus = "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";

export interface Voucher {
  id: string;
  code: string;
  systemCode: string;
  ownerCustomerId: string;
  label: string;
  discountAmount: number;
  eligibleTiers: MembershipTier[];
  source: VoucherSource;
  status: VoucherStatus;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  disabled?: boolean;
  newCustomersOnly?: boolean;
}

export type Promotion = Voucher;
