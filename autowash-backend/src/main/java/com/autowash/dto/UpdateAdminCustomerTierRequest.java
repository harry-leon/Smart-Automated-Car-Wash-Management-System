package com.autowash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateAdminCustomerTierRequest(
        @NotBlank(message = "Tier is required")
        @Pattern(regexp = "^(BRONZE|SILVER|GOLD|PLATINUM|DIAMOND)$", message = "Invalid tier")
        String tier
) {}
