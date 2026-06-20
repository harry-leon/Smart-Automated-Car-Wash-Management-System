package com.autowash.entity;

import com.autowash.entity.enums.OtpAuditEvent;
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

@Entity
@Table(name = "otp_audit_logs")
public class OtpAuditLog {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AuthUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OtpPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private OtpAuditEvent eventType;

    @Column(name = "delivery_address", length = 255)
    private String deliveryAddress;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "request_ip", length = 64)
    private String requestIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "device_fingerprint", length = 255)
    private String deviceFingerprint;

    @Column(length = 500)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected OtpAuditLog() {
    }

    public OtpAuditLog(
            AuthUser user,
            OtpPurpose purpose,
            OtpAuditEvent eventType,
            String deliveryAddress,
            int attemptCount,
            String requestIp,
            String userAgent,
            String deviceFingerprint,
            String message
    ) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.purpose = purpose;
        this.eventType = eventType;
        this.deliveryAddress = deliveryAddress;
        this.attemptCount = attemptCount;
        this.requestIp = requestIp;
        this.userAgent = userAgent;
        this.deviceFingerprint = deviceFingerprint;
        this.message = message;
        this.createdAt = Instant.now();
    }
}
