import type { LoyaltyTier } from "@/entities/loyalty";

export type PromotionDiscountType = "PERCENT" | "FIXED";
export type PromotionTargetingMode = "ALL_TIERS" | "SELECTED_TIERS";
export type PromotionStatus = "ACTIVE" | "INACTIVE";

export type Promotion = {
  promotionId: string;
  name: string;
  description: string | null;
  discountType?: PromotionDiscountType;
  discountValue?: number;
  pointMultiplier?: number | null;
  startDate: string;
  endDate: string;
  targetingMode: PromotionTargetingMode;
  applicableTiers: LoyaltyTier[];
  maxUsagePerCustomer: number | null;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
};

export type PromotionListPage = {
  items: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type PromotionRequest = {
  name: string;
  description: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  targetingMode: PromotionTargetingMode;
  applicableTiers: LoyaltyTier[] | null;
  maxUsagePerCustomer: number | null;
  status: PromotionStatus;
};


