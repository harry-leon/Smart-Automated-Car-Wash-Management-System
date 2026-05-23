package com.autowash.operation.presentation.dto;

import com.autowash.operation.domain.WashSessionStatus;
import java.time.Instant;
import java.util.List;

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
            WashSessionStatus status,
            String label,
            List<WashSessionCard> sessions
    ) {
    }

    public record WashSessionCard(
            String washSessionId,
            String bookingId,
            String confirmationNumber,
            String customerName,
            String customerPhone,
            String vehiclePlate,
            String packageName,
            String assignedStaffName,
            WashSessionStatus status,
            Instant scheduledAt,
            Instant checkedInAt,
            Instant startedAt,
            int estimatedDurationMinutes,
            String priority
    ) {
    }
}
