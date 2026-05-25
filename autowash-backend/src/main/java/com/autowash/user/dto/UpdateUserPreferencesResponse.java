package com.autowash.user.dto;

import java.time.Instant;

public record UpdateUserPreferencesResponse(
        String language,
        String theme,
        boolean notificationsEnabled,
        Instant updatedAt
) {
}
