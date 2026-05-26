package com.autowash.loyalty.dto;

import java.util.UUID;

public record EarnPointsResponse(
        UUID transactionId,
        int pointsAwarded,
        int newBalance,
        String tier
) {
}
