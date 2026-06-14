package com.autowash.dto;

import java.time.Instant;
import java.time.LocalDate;

public record BookingListItemResponse(
        String bookingId,
        String vehiclePlate,
        String packageName,
        LocalDate bookingDate,
        String bookingTime,
        long finalAmount,
        String status,
        String washStatus,
        Instant createdAt,
        Instant completedAt
) {
}
