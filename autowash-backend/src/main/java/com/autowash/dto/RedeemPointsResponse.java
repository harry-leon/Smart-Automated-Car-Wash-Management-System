package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record RedeemPointsResponse(
        UUID transactionId,
        int pointsRedeemed,
        int newBalance,
        String voucherCode,
        long voucherValue,
        Instant expiresAt,
        String status
) {
}
