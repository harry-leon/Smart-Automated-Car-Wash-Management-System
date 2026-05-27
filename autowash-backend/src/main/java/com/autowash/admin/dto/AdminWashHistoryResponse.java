package com.autowash.admin.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AdminWashHistoryResponse(
        UUID sessionId,
        String bookingId,
        String vehiclePlate,
        ServicePackageSummary servicePackage,
        String status,
        LocalDate bookingDate,
        LocalTime bookingTime,
        Instant startedAt,
        Instant completedAt,
        Fee fee,
        Integer pointsAwarded
) {

    public record ServicePackageSummary(String id, String name) {
    }

    public record Fee(Long amount, String currency) {
    }
}
