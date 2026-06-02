import assert from "node:assert/strict";
import test from "node:test";
import {
  canRedeemTierOffer,
  formatLoyaltyPoints,
  formatLoyaltyTransactionType,
  formatPromotionType,
  formatTierLabel,
  getTierProgress,
  TIER_VOUCHER_OFFERS,
} from "./customer-loyalty.ts";

test("computes loyalty tier progress against the next threshold", () => {
  assert.deepEqual(getTierProgress("MEMBER", 320), {
    currentTier: "MEMBER",
    nextTier: "SILVER",
    currentPoints: 320,
    nextThreshold: 500,
    pointsToNextTier: 180,
    progressPercent: 64,
  });
});

test("caps loyalty progress at 100 percent for the highest tier", () => {
  assert.deepEqual(getTierProgress("PLATINUM", 4800), {
    currentTier: "PLATINUM",
    nextTier: null,
    currentPoints: 4800,
    nextThreshold: null,
    pointsToNextTier: 0,
    progressPercent: 100,
  });
});

test("formats tier, transaction, and promotion labels for customer pages", () => {
  assert.equal(formatTierLabel("GOLD"), "Gold");
  assert.equal(formatLoyaltyTransactionType("EARN"), "Points earned");
  assert.equal(formatLoyaltyTransactionType("TIER_UPGRADE"), "Tier upgraded");
  assert.equal(formatPromotionType("SELECTED_TIERS"), "Selected tiers");
  assert.equal(formatLoyaltyPoints(27), "+27 pts");
  assert.equal(formatLoyaltyPoints(-50), "-50 pts");
});

test("limits voucher offers by current loyalty tier", () => {
  const platinumOffer = TIER_VOUCHER_OFFERS.find((offer) => offer.minTier === "PLATINUM");
  assert.ok(platinumOffer);
  assert.equal(canRedeemTierOffer("GOLD", platinumOffer), false);
  assert.equal(canRedeemTierOffer("PLATINUM", platinumOffer), true);
});
