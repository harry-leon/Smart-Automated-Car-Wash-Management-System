package com.autowash.operation.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record OperationsQueueResponse(
        QueueSummary summary,
        List<QueueColumn> columns,
        Instant generatedAt
) {

    public record QueueSummary(
            int total,
            int pending,
            int checkedIn,
            int inProgress,
            int completed
    ) {
    }

    public record QueueColumn(
            String status,
            String label,
            List<WashSessionCard> sessions
    ) {
    }

    public record WashSessionCard(
            UUID sessionId,
            String bookingId,
            String customerName,
            String customerPhone,
            String vehiclePlate,
            String packageId,
            String status,
            LocalDate bookingDate,
            LocalTime bookingTime,
            Integer estimatedDurationMinutes,
            Long feeAmount,
            String feeCurrency,
            Integer projectedLoyaltyPoints,
            Integer awardedLoyaltyPoints,
            Instant queuedAt,
            Instant checkedInAt,
            Instant startedAt,
            Instant completedAt
    ) {
    }
}
