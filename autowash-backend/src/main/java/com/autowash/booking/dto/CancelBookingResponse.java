package com.autowash.booking.dto;

import java.time.Instant;

public record CancelBookingResponse(
        String bookingId,
        String status,
        Instant cancelledAt,
        long refundAmount,
        String refundStatus,
        String refundMessage
) {
}
