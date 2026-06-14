package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record UpdateAdminCustomerRoleResponse(
        UUID customerId,
        String role,
        Instant updatedAt
) {
}
