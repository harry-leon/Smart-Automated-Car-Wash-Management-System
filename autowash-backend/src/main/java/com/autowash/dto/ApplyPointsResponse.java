package com.autowash.dto;

public record ApplyPointsResponse(
        String bookingId,
        int pointsApplied,
        long discountAmount,
        long finalAmount,
        int loyaltyBalance,
        String currency
) {
}
