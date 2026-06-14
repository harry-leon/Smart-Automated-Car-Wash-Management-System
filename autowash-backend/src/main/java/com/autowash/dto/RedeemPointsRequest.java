package com.autowash.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RedeemPointsRequest(
        @NotNull @Positive Integer pointsToRedeem,
        String referenceId
) {
}
