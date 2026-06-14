package com.autowash.operation.dto;

import java.time.Instant;
import java.util.UUID;

public record BookingStaffTransferAuditResponse(
        UUID auditId,
        String bookingId,
        UUID sessionId,
        UUID fromStaffId,
        String fromStaffName,
        UUID toStaffId,
        String toStaffName,
        UUID actorId,
        String actorName,
        String reason,
        Instant createdAt
) {
}
