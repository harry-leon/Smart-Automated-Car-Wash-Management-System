package com.autowash.dto;

import java.time.Instant;

public record PayBookingResponse(
        String bookingId,
        String paymentId,
        String paymentMethod,
        String paymentStatus,
        long amount,
        String transactionRef,
        Instant paidAt,
        String bookingStatus
) {
}
