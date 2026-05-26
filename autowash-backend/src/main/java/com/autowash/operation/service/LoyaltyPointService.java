package com.autowash.operation.service;

import com.autowash.auth.entity.LoyaltyTier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoyaltyPointService {

    private final long pointsUnitAmount;

    public LoyaltyPointService(@Value("${autowash.loyalty.points-unit-amount}") long pointsUnitAmount) {
        this.pointsUnitAmount = pointsUnitAmount;
    }

    public int calculateProjectedPoints(long finalAmount, LoyaltyTier tier) {
        // Mirrors PROJECT.md loyalty display rules until the dedicated loyalty module lands.
        long basePoints = finalAmount / pointsUnitAmount;
        return (int) Math.floor(basePoints * tierMultiplier(tier));
    }

    public int awardPoints(int projectedPoints) {
        // Loyalty ledger/account persistence belongs to the loyalty module.
        return projectedPoints;
    }

    private double tierMultiplier(LoyaltyTier tier) {
        return switch (tier) {
            case MEMBER -> 1.0;
            case SILVER -> 1.2;
            case GOLD -> 1.5;
            case PLATINUM -> 2.0;
        };
    }
}
