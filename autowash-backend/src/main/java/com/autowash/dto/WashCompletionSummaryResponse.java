package com.autowash.dto;

import java.time.Instant;

public record WashCompletionSummaryResponse(
        String washSessionId,
        String bookingId,
        String status,
        String serviceName,
        String vehiclePlate,
        long finalAmount,
        String paymentMethod,
        String paymentStatus,
        Integer awardedLoyaltyPoints,
        Integer projectedLoyaltyPoints,
        Instant completedAt,
        String assignedStaffName,
        String notes
) {}