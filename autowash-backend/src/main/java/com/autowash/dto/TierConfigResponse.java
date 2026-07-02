package com.autowash.dto;

import java.time.Instant;

public record TierConfigResponse(
        String tier,
        int minPoints,
        double pointMultiplier,
        int priorityScore,
        Instant updatedAt
) {
}
