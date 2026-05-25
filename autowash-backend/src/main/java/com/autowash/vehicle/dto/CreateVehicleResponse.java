package com.autowash.vehicle.dto;

import java.time.Instant;

public record CreateVehicleResponse(
        String vehicleId,
        String customerId,
        String plate,
        String type,
        String brand,
        String model,
        int year,
        String color,
        String status,
        boolean isPrimary,
        Instant createdAt
) {
}
