import type { CustomerTier } from "./customer.types";

export type PromotionType = "ALL_MEMBERS" | "SELECTED_TIERS" | "NEW_CUSTOMERS";

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  targetTiers: CustomerTier[];
  discountPercent: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
}

export type PromotionDraft = Omit<Promotion, "id" | "usageCount">;
