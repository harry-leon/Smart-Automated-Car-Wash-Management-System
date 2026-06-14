package com.autowash.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateAdminCustomerRoleRequest(
        @NotBlank(message = "role is required")
        String role
) {
}
