package com.autowash.user.dto;

import com.autowash.user.entity.LanguagePreference;
import com.autowash.user.entity.ThemePreference;
import jakarta.validation.constraints.NotNull;

public record UpdateUserPreferencesRequest(
        @NotNull(message = "Language is required")
        LanguagePreference language,

        @NotNull(message = "Theme is required")
        ThemePreference theme,

        @NotNull(message = "Notifications enabled is required")
        Boolean notificationsEnabled,

        @NotNull(message = "Email notifications is required")
        Boolean emailNotifications,

        @NotNull(message = "SMS notifications is required")
        Boolean smsNotifications
) {
}
