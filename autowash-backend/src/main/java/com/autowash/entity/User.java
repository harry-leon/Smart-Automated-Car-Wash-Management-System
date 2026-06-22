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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

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

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "email", unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserPreference preference;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Transient
    private boolean newCustomer;

    /**
     * Constructor used during registration.
     */
    public User(String fullName, String phone, String email, String passwordHash) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = UserRole.CUSTOMER;
        this.status = UserStatus.INACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
        this.newCustomer = true;
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

    /**
     * Update the user's role.
     */
    public void updateRole(com.autowash.entity.enums.UserRole role) {
        this.role = role;
        this.updatedAt = java.time.Instant.now();
    }



    public void setPreference(UserPreference preference) {
        this.preference = preference;
    }
}
