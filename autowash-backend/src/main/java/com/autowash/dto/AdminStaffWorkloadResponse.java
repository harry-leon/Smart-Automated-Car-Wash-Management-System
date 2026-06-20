package com.autowash.dto;

import java.util.UUID;

public record AdminStaffWorkloadResponse(
        UUID staffId,
        String staffName,
        long activeBookings,
        long activeSessions,
        long completedSessions,
        long completedRevenue
) {
}
