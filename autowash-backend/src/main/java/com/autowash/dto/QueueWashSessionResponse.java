package com.autowash.dto;

import java.util.UUID;
import lombok.Builder;

@Builder
public record QueueWashSessionResponse(
        UUID sessionId,
        String status
) {
}
