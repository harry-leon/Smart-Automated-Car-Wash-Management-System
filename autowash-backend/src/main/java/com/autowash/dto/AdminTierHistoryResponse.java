package com.autowash.dto;

import java.time.Instant;

public record AdminTierHistoryResponse(
        Long id,
        String fromTier,
        String toTier,
        String reason,
        Integer pointsAtChange,
        Instant changedAt
) {
}
