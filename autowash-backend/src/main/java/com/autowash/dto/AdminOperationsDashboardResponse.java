package com.autowash.dto;

public record AdminOperationsDashboardResponse(
        long totalSessions,
        long pendingSessions,
        long checkedInSessions,
        long inProgressSessions,
        long completedSessions,
        long activeStaff
) {
}
