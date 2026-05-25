package com.autowash.user.dto;

import java.time.Instant;

public record UserProfileResponse(
        String userId,
        String fullName,
        String phone,
        String email,
        String status,
        String role,
        String tier,
        boolean isNewCustomer,
        int loyaltyBalance,
        Instant registeredAt,
        UserPreferencesDto preferences
) {
}
