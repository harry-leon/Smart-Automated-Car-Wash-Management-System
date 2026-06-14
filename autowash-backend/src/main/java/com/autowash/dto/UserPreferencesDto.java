package com.autowash.dto;

public record UserPreferencesDto(
        String language,
        String theme,
        boolean notificationsEnabled,
        boolean emailNotifications,
        boolean smsNotifications
) {
}
