package com.autowash.dto;

import java.time.Instant;

public record ReviewResponse(
        String id,
        String customerId,
        String customerName,
        String bookingId,
        int rating,
        String comment,
        String beforeImageUrl,
        String afterImageUrl,
        boolean featured,
        Instant createdAt
) {
}
