package com.autowash.entity;

import com.autowash.entity.enums.BookingOtpChallengeStatus;
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

@Entity
@Table(name = "booking_otp_challenges")
public class BookingOtpChallenge {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @Column(name = "code_hash", nullable = false, length = 255)
    private String codeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingOtpChallengeStatus status;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "delivery_email", nullable = false, length = 255)
    private String deliveryEmail;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "dev_otp", length = 10)
    private String devOtp;

    protected BookingOtpChallenge() {
    }

    public BookingOtpChallenge(CustomerBooking booking, String codeHash, String deliveryEmail, Instant expiresAt) {
        this(booking, codeHash, deliveryEmail, expiresAt, null);
    }

    public BookingOtpChallenge(CustomerBooking booking, String codeHash, String deliveryEmail, Instant expiresAt, String devOtp) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.codeHash = codeHash;
        this.status = BookingOtpChallengeStatus.PENDING;
        this.attempts = 0;
        this.deliveryEmail = deliveryEmail;
        this.expiresAt = expiresAt;
        this.sentAt = now;
        this.devOtp = devOtp;
    }

    public CustomerBooking getBooking() { return booking; }
    public String getCodeHash() { return codeHash; }
    public BookingOtpChallengeStatus getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public String getDeliveryEmail() { return deliveryEmail; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getSentAt() { return sentAt; }
    public String getDevOtp() { return devOtp; }
    public boolean isLocked() { return lockedAt != null; }

    public void incrementAttempts() {
        this.attempts++;
    }

    public void verify() {
        this.status = BookingOtpChallengeStatus.VERIFIED;
        this.verifiedAt = Instant.now();
        this.invalidatedAt = this.verifiedAt;
    }

    public void expire() {
        this.status = BookingOtpChallengeStatus.EXPIRED;
        this.invalidatedAt = Instant.now();
    }

    public void cancel() {
        this.status = BookingOtpChallengeStatus.CANCELLED;
        this.invalidatedAt = Instant.now();
    }

    public void invalidate() {
        if (this.invalidatedAt == null) {
            this.invalidatedAt = Instant.now();
        }
        if (this.status == BookingOtpChallengeStatus.PENDING) {
            this.status = BookingOtpChallengeStatus.CANCELLED;
        }
    }

    public void lock() {
        if (this.lockedAt == null) {
            this.lockedAt = Instant.now();
        }
    }
}
