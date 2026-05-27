package com.autowash.catalog.dto;

import com.autowash.auth.entity.LoyaltyTier;
import com.autowash.catalog.entity.DiscountType;
import com.autowash.catalog.entity.PromotionStatus;
import com.autowash.catalog.entity.PromotionTargetingMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public record PromotionRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description,
        @NotNull DiscountType discountType,
        @Min(1) int discountValue,
        @NotNull Instant startDate,
        @NotNull Instant endDate,
        @NotNull PromotionTargetingMode targetingMode,
        List<LoyaltyTier> applicableTiers,
        @Min(1) Integer maxUsagePerCustomer,
        PromotionStatus status
) {
}
