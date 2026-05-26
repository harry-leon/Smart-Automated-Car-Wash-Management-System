package com.autowash.operation.dto;

import java.time.Instant;
import java.util.UUID;

public record CheckInWashSessionResponse(
        UUID sessionId,
        String status,
        Instant checkedInAt,
        Fee fee,
        int projectedLoyaltyPoints
) {
    public record Fee(long amount, String currency) {
    }
}
