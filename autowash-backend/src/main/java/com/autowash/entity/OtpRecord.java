package com.autowash.entity;

import com.autowash.entity.enums.OtpPurpose;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "otp_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OtpRecord {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OtpPurpose purpose;

    @Column(nullable = false, length = 255)
    private String code;

    @Column(name = "delivery_address", nullable = false, length = 255)
    private String deliveryAddress;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private int attempts;

    @Column(nullable = false)
    private boolean verified;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public OtpRecord(AuthUser user, OtpPurpose purpose, String codeHash, String deliveryAddress, Instant expiresAt) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.purpose = purpose;
        this.code = codeHash;
        this.deliveryAddress = deliveryAddress;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.verified = false;
        this.createdAt = Instant.now();
    }

    public boolean isLocked() {
        return lockedAt != null;
    }

    public boolean isInvalidated() {
        return invalidatedAt != null;
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public void markVerified() {
        this.verified = true;
        this.invalidatedAt = Instant.now();
    }

    public void invalidate() {
        if (this.invalidatedAt == null) {
            this.invalidatedAt = Instant.now();
        }
    }

    public void lock() {
        if (this.lockedAt == null) {
            this.lockedAt = Instant.now();
            invalidate();
        }
    }
}

