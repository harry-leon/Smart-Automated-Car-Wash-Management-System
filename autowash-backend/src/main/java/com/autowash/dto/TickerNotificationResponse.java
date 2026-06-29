package com.autowash.dto;

import java.time.Instant;

public record TickerNotificationResponse(
        String type,
        String title,
        String message,
        Instant createdAt
) {
}
