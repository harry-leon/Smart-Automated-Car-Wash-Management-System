package com.autowash.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerDetailResponse(
        UUID customerId,
        CustomerProfile profile,
        CustomerLoyalty loyalty,
        CustomerSummary summary
) {

    public record CustomerProfile(
            String fullName,
            String phone,
            String email,
            String status,
            String tier,
            Instant registeredAt
    ) {
    }

    public record CustomerLoyalty(
            int currentPoints,
            String tier,
            Instant updatedAt
    ) {
    }

    public record CustomerSummary(
            long totalBookings,
            long completedBookings,
            long cancelledBookings,
            long totalWashSessions,
            long totalSpent,
            long totalPointsEarned,
            long totalPointsSpent,
            Instant lastBookingDate,
            Long lastBookingAmount
    ) {
    }
}
