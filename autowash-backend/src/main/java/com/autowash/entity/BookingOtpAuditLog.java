package com.autowash.entity;

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
@Table(name = "booking_otp_audit_logs")
public class BookingOtpAuditLog {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private BookingOtpAuditEvent eventType;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "delivery_email", length = 255)
    private String deliveryEmail;

    @Column(name = "request_ip", length = 64)
    private String requestIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(length = 500)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BookingOtpAuditLog() {
    }

    public BookingOtpAuditLog(
            CustomerBooking booking,
            BookingOtpAuditEvent eventType,
            int attemptCount,
            String deliveryEmail,
            String requestIp,
            String userAgent,
            String message
    ) {
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.eventType = eventType;
        this.attemptCount = attemptCount;
        this.deliveryEmail = deliveryEmail;
        this.requestIp = requestIp;
        this.userAgent = userAgent;
        this.message = message;
        this.createdAt = Instant.now();
    }
}
