package com.autowash.catalog.dto;

import java.time.Instant;

public record ValidateVoucherResponse(
        String voucherCode,
        boolean isValid,
        String discountType,
        int discountValue,
        long discountAmount,
        long finalAmount,
        Instant expiresAt
) {
}
