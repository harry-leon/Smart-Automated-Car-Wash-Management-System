package com.autowash.dto;

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
