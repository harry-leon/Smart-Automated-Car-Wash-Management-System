package com.autowash.dto;

import java.time.Instant;

public record RedeemPointsResponse(
        Long transactionId,
        int pointsRedeemed,
        int newBalance,
        String voucherCode,
        long voucherValue,
        Instant expiresAt,
        String status
) {
}
