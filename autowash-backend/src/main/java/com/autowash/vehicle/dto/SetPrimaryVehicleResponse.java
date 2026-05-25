package com.autowash.vehicle.dto;

import java.time.Instant;

public record SetPrimaryVehicleResponse(
        String vehicleId,
        String plate,
        boolean isPrimary,
        Instant updatedAt
) {
}
