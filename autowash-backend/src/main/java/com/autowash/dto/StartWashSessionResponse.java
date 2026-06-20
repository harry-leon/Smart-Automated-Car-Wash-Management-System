package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

@Builder
public record StartWashSessionResponse(
        UUID sessionId,
        String status,
        Instant startedAt
) {
}
