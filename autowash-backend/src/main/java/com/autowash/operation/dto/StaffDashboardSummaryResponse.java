package com.autowash.operation.dto;

public record StaffDashboardSummaryResponse(
        String staffId,
        String staffName,
        long assignedActiveBookings,
        long pendingBookings,
        long activeSessions,
        long completedSessions,
        long completedRevenue,
        long kpiTargetRevenue,
        int kpiProgressPercent
) {
}
