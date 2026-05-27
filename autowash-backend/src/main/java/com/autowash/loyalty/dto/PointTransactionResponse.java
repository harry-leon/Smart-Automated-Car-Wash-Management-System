package com.autowash.loyalty.dto;

import java.time.Instant;
import java.util.UUID;

public record PointTransactionResponse(
        UUID transactionId,
        String type,
        int points,
        int balanceAfter,
        String reason,
        String referenceId,
        Instant createdAt
) {
}
