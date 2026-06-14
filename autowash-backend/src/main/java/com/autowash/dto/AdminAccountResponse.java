package com.autowash.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminAccountResponse(
        UUID accountId,
        String fullName,
        String phone,
        String email,
        String role,
        String status,
        String tier,
        Instant createdAt,
        Instant updatedAt
) {
}
