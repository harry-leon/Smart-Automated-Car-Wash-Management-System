package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

@Builder
public record NotificationResponse(
        UUID notificationId,
        String title,
        String message,
        String type,
        boolean read,
        Instant createdAt
) {
}
