package com.autowash.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminTierHistoryResponse(
        UUID id,
        String fromTier,
        String toTier,
        String reason,
        Integer pointsAtChange,
        Instant changedAt
) {
}
