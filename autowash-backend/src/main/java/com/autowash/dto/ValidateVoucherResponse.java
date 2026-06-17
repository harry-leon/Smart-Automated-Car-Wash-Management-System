package com.autowash.dto;

import com.autowash.enums.DiscountType;

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
