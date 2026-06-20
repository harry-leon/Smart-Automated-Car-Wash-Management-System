package com.autowash.dto;

public record EarnPointsResponse(
        Long transactionId,
        int pointsAwarded,
        int newBalance,
        String tier
) {
}
