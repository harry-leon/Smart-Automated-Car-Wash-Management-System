package com.autowash.dto;
import java.time.Instant;

public record NotificationTickerItem(
        String id,
        String message,
        String type,
        Instant createdAt
) {}
