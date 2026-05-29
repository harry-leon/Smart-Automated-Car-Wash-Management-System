import type { ApiPaginatedResponse } from "@/types/api.types";
import type { LoyaltyTier } from "@/types/loyalty.types";

export type AdminPromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";
export type AdminPromotionTargetingMode = "ALL_MEMBERS" | "SELECTED_TIERS" | "NEW_CUSTOMERS";

export type AdminPromotion = {
  promotionId: string;
  name: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  targetingMode: AdminPromotionTargetingMode;
  applicableTiers: LoyaltyTier[];
  maxUsagePerCustomer: number | null;
  status: AdminPromotionStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminPromotionListPage = {
  items: AdminPromotion[];
  pagination: ApiPaginatedResponse<never>["pagination"];
};
