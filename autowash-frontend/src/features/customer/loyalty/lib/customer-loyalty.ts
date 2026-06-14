import type {
  LoyaltyAccount,
  LoyaltyTier,
  LoyaltyTransactionType,
  TierVoucherOffer,
  PromotionType,
} from "@/features/customer/loyalty/loyalty.types";

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

const TIER_RANK: Record<LoyaltyTier, number> = {
  MEMBER: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};

export const TIER_VOUCHER_OFFERS: TierVoucherOffer[] = [
  {
    id: "member-50",
    title: "Quick Clean Voucher",
    minTier: "MEMBER",
    pointsCost: 50,
    voucherValue: 50000,
    accent: "sky",
    badge: "Member",
  },
  {
    id: "silver-100",
    title: "Interior Care Voucher",
    minTier: "SILVER",
    pointsCost: 100,
    voucherValue: 100000,
    accent: "violet",
    badge: "Silver",
  },
  {
    id: "gold-150",
    title: "Premium Wash Voucher",
    minTier: "GOLD",
    pointsCost: 150,
    voucherValue: 150000,
    accent: "amber",
    badge: "Gold",
  },
  {
    id: "platinum-200",
    title: "Full Detail Voucher",
    minTier: "PLATINUM",
    pointsCost: 200,
    voucherValue: 200000,
    accent: "rose",
    badge: "Platinum",
  },
];

export function formatTierLabel(tier: LoyaltyTier) {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export function canRedeemTierOffer(currentTier: LoyaltyTier, offer: TierVoucherOffer) {
  return TIER_RANK[currentTier] >= TIER_RANK[offer.minTier];
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
    case "TIER_UPGRADE":
      return "Tier upgraded";
    case "ADJUST":
      return "Manual adjust";
  }
}

export function formatLoyaltyPoints(points: number) {
  const prefix = points > 0 ? "+" : "";
  return `${prefix}${points.toLocaleString("vi-VN")} pts`;
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
  const availablePoints = account.availablePoints ?? account.currentPoints;
  const lifetimePoints = account.lifetimePoints ?? account.totalEarnedPoints;

  return {
    ...account,
    availablePoints,
    lifetimePoints,
    tierLabel: formatTierLabel(account.tier),
    progress: getTierProgress(account.tier, lifetimePoints),
    voucherOffers: TIER_VOUCHER_OFFERS.map((offer) => ({
      ...offer,
      eligible: canRedeemTierOffer(account.tier, offer),
      affordable: availablePoints >= offer.pointsCost,
    })),
  };
}
