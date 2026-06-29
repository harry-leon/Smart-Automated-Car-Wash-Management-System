package com.autowash.dto;

import java.time.Instant;
import lombok.Builder;

@Builder
public record ReviewResponse(
        String reviewId,
        String bookingId,
        String customerId,
        String customerName,
        int rating,
        String comment,
        String beforeImageUrl,
        String afterImageUrl,
        boolean featured,
        Instant createdAt
) {
}
