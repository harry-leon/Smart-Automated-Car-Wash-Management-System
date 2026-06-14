package com.autowash.dto;

import java.time.Instant;

public record UpdateUserPreferencesResponse(
        String language,
        String theme,
        boolean notificationsEnabled,
        Instant updatedAt
) {
}
