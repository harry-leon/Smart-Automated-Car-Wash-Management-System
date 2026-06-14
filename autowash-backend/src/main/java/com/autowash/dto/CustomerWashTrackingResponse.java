package com.autowash.dto;

import java.time.Instant;
import java.time.LocalDate;

public record CustomerWashTrackingResponse(
        String washSessionId,
        String bookingId,
        String status,
        String customerName,
        String customerPhone,
        String vehiclePlate,
        String vehicleBrand,
        String vehicleModel,
        String packageId,
        String serviceName,
        LocalDate bookingDate,
        String bookingTime,
        String assignedStaffName,
        Long feeAmount,
        String feeCurrency,
        Integer projectedLoyaltyPoints,
        Integer awardedLoyaltyPoints,
        String notes,
        Instant createdAt,
        Instant queuedAt,
        Instant checkedInAt,
        Instant startedAt,
        Instant completedAt
) {
}
