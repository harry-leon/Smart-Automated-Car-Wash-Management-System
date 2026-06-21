package com.autowash.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record AdminWashHistoryResponse(
        UUID sessionId,
        String bookingId,
        String vehiclePlate,
        ServicePackageSummary Package,
        String status,
        LocalDate bookingDate,
        LocalTime bookingTime,
        Instant startedAt,
        Instant completedAt,
        Fee fee,
        Integer pointsAwarded
) {

    @Builder
    public record ServicePackageSummary(String id, String name) {
    }

    @Builder
    public record Fee(Long amount) {
    }
}
