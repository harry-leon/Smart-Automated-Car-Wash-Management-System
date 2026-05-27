package com.autowash.loyalty.dto;

import java.time.Instant;

public record LoyaltyTransactionResponse(
        String transactionId,
        String sessionId,
        String bookingId,
        String type,
        int points,
        String description,
        Instant createdAt
) {
}
