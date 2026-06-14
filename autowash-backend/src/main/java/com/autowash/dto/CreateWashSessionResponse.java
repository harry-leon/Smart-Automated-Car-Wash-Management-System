package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record CreateWashSessionResponse(
        UUID sessionId,
        String status,
        String bookingId,
        Instant createdAt
) {
}
