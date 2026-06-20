package com.autowash.dto;

import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;

@Builder
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
        Integer projectedLoyaltyPoints,
        Integer awardedLoyaltyPoints,
        String notes,
        Instant createdAt,
        Instant checkedInAt,
        Instant startedAt,
        Instant completedAt
) {
}
