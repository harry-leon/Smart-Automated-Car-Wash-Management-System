package com.autowash.dto;

import java.time.Instant;

public record UpdateUserProfileResponse(
        String userId,
        String fullName,
        String phone,
        String email,
        Instant updatedAt
) {
}
