package com.autowash.dto;

import com.autowash.service.LoyaltyRules;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ApplyPointsRequest(
        @NotNull(message = "pointsToApply is required")
        @Min(value = LoyaltyRules.MIN_REDEMPTION_POINTS, message = "pointsToApply must meet the minimum redemption threshold")
        @Max(value = LoyaltyRules.MAX_REDEMPTION_POINTS, message = "pointsToApply must not exceed the maximum redemption threshold")
        Integer pointsToApply
) {
}
