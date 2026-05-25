package com.autowash.vehicle.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateVehicleRequest(
        @NotBlank(message = "Brand is required")
        @Size(max = 50, message = "Brand must be at most 50 characters")
        String brand,

        @NotBlank(message = "Model is required")
        @Size(max = 50, message = "Model must be at most 50 characters")
        String model,

        @NotNull(message = "Year is required")
        @Min(value = 1900, message = "Year must be a valid 4-digit year")
        @Max(value = 2100, message = "Year must be a valid 4-digit year")
        Integer year,

        @Size(max = 30, message = "Color must be at most 30 characters")
        String color
) {
}
