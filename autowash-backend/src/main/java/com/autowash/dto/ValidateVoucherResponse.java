package com.autowash.dto;

import com.autowash.entity.enums.DiscountType;
import java.time.Instant;

public record ValidateVoucherResponse(
        String voucherCode,
        boolean isValid,
        String discountType,
        long discountValue,
        long discountAmount,
        long finalAmount,
        Instant expiresAt
) {
}
