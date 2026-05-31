export type LoyaltyTier = "MEMBER" | "SILVER" | "GOLD" | "PLATINUM";

export type LoyaltyAccount = {
  customerId: string;
  tier: LoyaltyTier;
  currentPoints: number;
  totalEarnedPoints: number;
  completedWashCount: number;
};

export type LoyaltyTransactionType =
  | "EARN"
  | "REDEEM"
  | "BONUS"
  | "ADJUSTMENT"
  | "EXPIRE";

export type LoyaltyTransaction = {
  transactionId: string;
  sessionId: string;
  bookingId: string;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  createdAt: string;
};

export type WashHistoryItem = {
  sessionId: string;
  bookingId: string;
  vehiclePlate: string;
  packageName: string | null;
  bookingDate: string;
  bookingTime: string;
  finalAmount: number;
  awardedPoints: number;
  status: "COMPLETED";
  completedAt: string;
};

export type PromotionType = "ALL_TIERS" | "SELECTED_TIERS" | "NEW_CUSTOMERS";

export type CustomerPromotion = {
  promotionId: string;
  name: string;
  description: string | null;
  promotionType: PromotionType;
  targetTiers: LoyaltyTier[];
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  expiresAt: string;
  status: "ACTIVE" | "INACTIVE";
};
