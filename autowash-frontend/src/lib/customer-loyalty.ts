import type {
  LoyaltyAccount,
  LoyaltyTier,
  LoyaltyTransactionType,
  PromotionType,
} from "@/types/loyalty.types";

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  MEMBER: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 4000,
};

const NEXT_TIER: Record<LoyaltyTier, LoyaltyTier | null> = {
  MEMBER: "SILVER",
  SILVER: "GOLD",
  GOLD: "PLATINUM",
  PLATINUM: null,
};

export function formatTierLabel(tier: LoyaltyTier) {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export function formatLoyaltyTransactionType(type: LoyaltyTransactionType) {
  switch (type) {
    case "EARN":
      return "Points earned";
    case "REDEEM":
      return "Points redeemed";
    case "BONUS":
      return "Bonus points";
    case "ADJUSTMENT":
      return "Manual adjustment";
    case "EXPIRE":
      return "Expired points";
  }
}

export function formatPromotionType(type: PromotionType) {
  switch (type) {
    case "ALL_TIERS":
      return "All members";
    case "SELECTED_TIERS":
      return "Selected tiers";
    case "NEW_CUSTOMERS":
      return "New customers";
  }
}

export function getTierProgress(tier: LoyaltyTier, currentPoints: number) {
  const nextTier = NEXT_TIER[tier];
  if (!nextTier) {
    return {
      currentTier: tier,
      nextTier: null,
      currentPoints,
      nextThreshold: null,
      pointsToNextTier: 0,
      progressPercent: 100,
    };
  }

  const baseThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const earnedWithinTier = Math.max(currentPoints - baseThreshold, 0);
  const tierSpan = Math.max(nextThreshold - baseThreshold, 1);
  const progressPercent = Math.min(100, Math.round((earnedWithinTier / tierSpan) * 100));

  return {
    currentTier: tier,
    nextTier,
    currentPoints,
    nextThreshold,
    pointsToNextTier: Math.max(nextThreshold - currentPoints, 0),
    progressPercent,
  };
}

export function buildLoyaltySummary(account: LoyaltyAccount) {
  return {
    ...account,
    tierLabel: formatTierLabel(account.tier),
    progress: getTierProgress(account.tier, account.currentPoints),
  };
}
