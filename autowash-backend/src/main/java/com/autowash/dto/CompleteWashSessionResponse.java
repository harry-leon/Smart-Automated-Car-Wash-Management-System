package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record CompleteWashSessionResponse(
        UUID sessionId,
        String status,
        Instant completedAt,
        int awardedLoyaltyPoints
) {
}
