package com.autowash.user.dto;

import java.time.Instant;

public record UpdateUserProfileResponse(
        String userId,
        String fullName,
        String phone,
        String email,
        Instant updatedAt
) {
}
