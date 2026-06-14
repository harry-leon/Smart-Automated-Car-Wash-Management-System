package com.autowash.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EarnPointsRequest(
        @NotNull UUID customerId,
        @NotNull UUID sessionId
) {
}
