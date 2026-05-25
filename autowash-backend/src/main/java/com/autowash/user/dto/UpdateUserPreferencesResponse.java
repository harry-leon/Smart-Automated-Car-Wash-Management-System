package com.autowash.user.dto;

import java.time.Instant;

public record UpdateUserPreferencesResponse(
        String userId,
        String language,
        String theme,
        boolean notificationsEnabled,
        boolean emailNotifications,
        boolean smsNotifications,
        Instant updatedAt
) {
}
