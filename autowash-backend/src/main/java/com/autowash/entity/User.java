package com.autowash.entity;

import com.autowash.entity.enums.UserRole;
import com.autowash.entity.enums.UserStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "users")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    private UUID id;
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    @Column(name = "phone", nullable = true, unique = true, length = 20)
    private String phone;
    @Column(name = "email", unique = true, length = 255)
    private String email;
    @Column(name = "password_hash", nullable = true, length = 255)
    private String passwordHash;
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserPreference preference;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Transient
    private boolean newCustomer;

    public User(String fullName, String phone, String email, String passwordHash) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = UserRole.CUSTOMER;
        this.status = UserStatus.PENDING;
        this.createdAt = now;
        this.updatedAt = now;
        this.newCustomer = true;
    }

    /**
     * Factory method for users created via Google OAuth.
     * phone and passwordHash are null — user signed in with Google only.
     * Status is immediately ACTIVE because Google already verified the email.
     * fullName is taken directly from the Google profile name.
     */
    public static User fromGoogle(String fullName, String email, String avatarUrl) {
        Instant now = Instant.now();
        User user = new User();
        user.id = UUID.randomUUID();
        user.fullName = (fullName != null && !fullName.isBlank()) ? fullName : email;
        user.phone = null;
        user.email = email;
        user.passwordHash = null;
        user.avatarUrl = avatarUrl;
        user.role = UserRole.CUSTOMER;
        user.status = UserStatus.ACTIVE;
        user.createdAt = now;
        user.updatedAt = now;
        user.newCustomer = true;
        return user;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = Instant.now();
    }

    public void updateRole(UserRole role) {
        this.role = role;
        this.updatedAt = Instant.now();
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.updatedAt = Instant.now();
    }

    public void setPhone(String phone) {
        this.phone = phone;
        this.updatedAt = Instant.now();
    }

    public void setEmail(String email) {
        this.email = email;
        this.updatedAt = Instant.now();
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        this.updatedAt = Instant.now();
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void updateStatus(UserStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.updatedAt = Instant.now();
    }

    public void markNotNewCustomer() {
        this.newCustomer = false;
        this.updatedAt = Instant.now();
    }

    public boolean isNewCustomer() {
        return newCustomer;
    }
}
