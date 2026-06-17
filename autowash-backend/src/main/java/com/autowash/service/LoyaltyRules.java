package com.autowash.service;

import com.autowash.enums.LoyaltyTier;
import java.util.List;

public final class LoyaltyRules {

    public static final int EARN_POINTS_UNIT_AMOUNT = 10_000;
    public static final int MIN_REDEMPTION_POINTS = 50;
    public static final int MAX_REDEMPTION_POINTS = 200;
    public static final int VND_PER_POINT = 1_000;

    public static final List<TierThreshold> TIER_THRESHOLDS = List.of(
            new TierThreshold(LoyaltyTier.MEMBER, 0),
            new TierThreshold(LoyaltyTier.SILVER, 500),
            new TierThreshold(LoyaltyTier.GOLD, 1_500),
            new TierThreshold(LoyaltyTier.PLATINUM, 4_000)
    );

    private LoyaltyRules() {
    }

    public static double tierMultiplier(LoyaltyTier tier) {
        return switch (tier) {
            case MEMBER -> 1.0;
            case SILVER -> 1.2;
            case GOLD -> 1.5;
            case PLATINUM -> 2.0;
        };
    }

    public static LoyaltyTier tierForPoints(int points) {
        LoyaltyTier tier = LoyaltyTier.MEMBER;
        for (TierThreshold threshold : TIER_THRESHOLDS) {
            if (points >= threshold.minPoints()) {
                tier = threshold.tier();
            }
        }
        return tier;
    }

    public record TierThreshold(LoyaltyTier tier, int minPoints) {
    }
}
