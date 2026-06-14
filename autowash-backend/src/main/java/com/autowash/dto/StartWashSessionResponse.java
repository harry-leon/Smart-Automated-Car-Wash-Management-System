package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record StartWashSessionResponse(
        UUID sessionId,
        String status,
        Instant startedAt
) {
}
