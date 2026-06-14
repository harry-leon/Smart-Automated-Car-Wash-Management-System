package com.autowash.dto;

import java.time.Instant;

public record UpdateVehicleResponse(
        String vehicleId,
        String plate,
        String brand,
        String model,
        int year,
        String color,
        Instant updatedAt
) {
}
