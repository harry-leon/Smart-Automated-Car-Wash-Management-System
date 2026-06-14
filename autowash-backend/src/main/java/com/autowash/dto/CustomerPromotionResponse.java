package com.autowash.dto;

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
