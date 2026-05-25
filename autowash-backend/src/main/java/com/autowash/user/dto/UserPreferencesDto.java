package com.autowash.user.dto;

public record UserPreferencesDto(
        String language,
        String theme,
        boolean notificationsEnabled,
        boolean emailNotifications,
        boolean smsNotifications
) {
}
