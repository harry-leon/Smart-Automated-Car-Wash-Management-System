package com.autowash.loyalty.dto;

import java.time.Instant;
import java.time.LocalDate;

public record WashHistoryItemResponse(
        String sessionId,
        String bookingId,
        String vehiclePlate,
        String packageName,
        LocalDate bookingDate,
        String bookingTime,
        long finalAmount,
        int awardedPoints,
        String status,
        Instant completedAt
) {
}
