package com.autowash.dto;

public record VehicleListItemResponse(
        String vehicleId,
        String plate,
        String type,
        String brand,
        String model,
        String color,
        boolean isPrimary,
        String status
) {
}
