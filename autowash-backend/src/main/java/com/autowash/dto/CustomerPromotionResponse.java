package com.autowash.dto;

import com.autowash.entity.enums.DiscountType;
import java.time.Instant;
import java.util.List;

public record CustomerPromotionResponse(
        String promotionCode,
        String title,
        String promotionType,
        List<String> targetTiers,
        String discountType,
        int discountValue,
        long minAmount,
        boolean newCustomerOnly,
        Instant expiresAt
) {
}
