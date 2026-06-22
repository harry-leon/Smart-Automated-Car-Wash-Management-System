package com.autowash.entity;

import com.autowash.entity.enums.LanguagePreference;
import com.autowash.entity.enums.ThemePreference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_preferences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserPreference {

    @Id
    private UUID userId;

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LanguagePreference language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ThemePreference theme;

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled;

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications;

    @Column(name = "sms_notifications", nullable = false)
    private boolean smsNotifications;

    public UserPreference(User user) {
        this.user = user;
        this.language = LanguagePreference.VI;
        this.theme = ThemePreference.LIGHT;
        this.notificationsEnabled = true;
        this.emailNotifications = false;
        this.smsNotifications = true;
    }

    public void update(
            LanguagePreference language,
            ThemePreference theme,
            boolean notificationsEnabled,
            boolean emailNotifications,
            boolean smsNotifications
    ) {
        this.language = language;
        this.theme = theme;
        this.notificationsEnabled = notificationsEnabled;
        this.emailNotifications = emailNotifications;
        this.smsNotifications = smsNotifications;
    }
}

