package com.autowash.dto;

import java.time.Instant;
public record PointTransactionResponse(
        Long transactionId,
        String type,
        int points,
        int balanceAfter,
        String reason,
        String referenceId,
        Instant createdAt
) {
}
