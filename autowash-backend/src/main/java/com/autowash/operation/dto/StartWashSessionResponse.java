package com.autowash.operation.dto;

import java.time.Instant;
import java.util.UUID;

public record StartWashSessionResponse(
        UUID sessionId,
        String status,
        Instant startedAt
) {
}
