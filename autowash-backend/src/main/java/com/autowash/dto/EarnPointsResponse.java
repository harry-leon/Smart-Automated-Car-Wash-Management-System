package com.autowash.dto;

import java.util.UUID;

public record EarnPointsResponse(
        UUID transactionId,
        int pointsAwarded,
        int newBalance,
        String tier
) {
}
