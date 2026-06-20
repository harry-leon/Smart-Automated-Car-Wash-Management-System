package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminVoucherRedemptionResponse(
        String transactionId,
        UUID customerId,
        String customerName,
        String customerPhone,
        String voucherCode,
        int pointsRedeemed,
        int balanceAfter,
        Instant redeemedAt
) {
}
