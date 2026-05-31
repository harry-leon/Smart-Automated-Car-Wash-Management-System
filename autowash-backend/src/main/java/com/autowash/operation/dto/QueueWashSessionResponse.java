package com.autowash.operation.dto;

import java.time.Instant;
import java.util.UUID;

public record QueueWashSessionResponse(
        UUID sessionId,
        String status,
        Instant queuedAt
) {
}
