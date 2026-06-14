package com.autowash.entity;

import com.autowash.entity.LanguagePreference;
import com.autowash.entity.ThemePreference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_users")
public class AuthUser {

    @Id
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "auth_provider", nullable = false, length = 20)
    private String authProvider;

    @Column(name = "oauth_subject", length = 255)
    private String oauthSubject;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoyaltyTier tier;

    @Column(name = "is_new_customer", nullable = false)
    private boolean isNewCustomer;

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

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AuthUser() {
    }

    public AuthUser(String fullName, String phone, String email, String passwordHash) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.authProvider = "LOCAL";
        this.oauthSubject = null;
        this.emailVerified = false;
        this.avatarUrl = null;
        this.role = UserRole.CUSTOMER;
        this.status = UserStatus.PENDING_VERIFY;
        this.tier = LoyaltyTier.MEMBER;
        this.isNewCustomer = true;
        this.language = LanguagePreference.VI;
        this.theme = ThemePreference.LIGHT;
        this.notificationsEnabled = true;
        this.emailNotifications = false;
        this.smsNotifications = true;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public static AuthUser createGoogleCustomer(
            String fullName,
            String phone,
            String email,
            String oauthSubject,
            String avatarUrl,
            String passwordHash
    ) {
        AuthUser user = new AuthUser(fullName, phone, email, passwordHash);
        user.authProvider = "GOOGLE";
        user.oauthSubject = oauthSubject;
        user.emailVerified = true;
        user.avatarUrl = avatarUrl;
        user.status = UserStatus.ACTIVE;
        user.isNewCustomer = true;
        return user;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public String getOauthSubject() {
        return oauthSubject;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public LoyaltyTier getTier() {
        return tier;
    }

    public boolean isNewCustomer() {
        return isNewCustomer;
    }

    public LanguagePreference getLanguage() {
        return language;
    }

    public ThemePreference getTheme() {
        return theme;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public boolean isSmsNotifications() {
        return smsNotifications;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateProfile(String fullName, String email, String phone) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.updatedAt = Instant.now();
    }

    public void updatePreferences(
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
        this.updatedAt = Instant.now();
    }

    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.emailVerified = true;
        this.updatedAt = Instant.now();
    }

    public void updateTier(LoyaltyTier tier) {
        this.tier = tier;
        this.updatedAt = Instant.now();
    }

    public void updateRole(UserRole role) {
        this.role = role;
        this.updatedAt = Instant.now();
    }

    public void linkGoogleAccount(String oauthSubject, String email, String avatarUrl) {
        this.authProvider = "GOOGLE";
        this.oauthSubject = oauthSubject;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.emailVerified = true;
        this.updatedAt = Instant.now();
    }

    public void markEmailVerified() {
        this.emailVerified = true;
        this.updatedAt = Instant.now();
    }

    public void markNotNewCustomer() {
        this.isNewCustomer = false;
        this.updatedAt = Instant.now();
    }
}
