package com.autowash.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerVehicleResponse(
        UUID vehicleId,
        String plate,
        String type,
        String brand,
        String model,
        String color,
        String status,
        boolean isPrimary,
        Instant lastServiceDate,
        Long totalServices
) {
}
