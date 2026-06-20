package com.autowash.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

@Builder
public record OperationsQueueResponse(
        QueueSummary summary,
        List<QueueColumn> columns,
        Instant generatedAt
) {

    @Builder
    public record QueueSummary(
            int total,
            int pending,
            int checkedIn,
            int inProgress,
            int completed
    ) {
    }

    @Builder
    public record QueueColumn(
            String status,
            String label,
            List<WashSessionCard> sessions
    ) {
    }

    @Builder
    public record WashSessionCard(
            UUID sessionId,
            String bookingId,
            String customerName,
            String customerPhone,
            String vehiclePlate,
            String packageId,
            UUID assignedStaffId,
            String assignedStaffName,
            String status,
            LocalDate bookingDate,
            LocalTime bookingTime,
            Integer estimatedDurationMinutes,
            Long feeAmount,
            Integer projectedLoyaltyPoints,
            Integer awardedLoyaltyPoints,
            Instant checkedInAt,
            Instant startedAt,
            Instant completedAt,
            String notes
    ) {
    }
}
