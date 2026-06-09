package com.autowash.operation.entity;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.entity.CustomerBooking;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "booking_staff_transfer_audits")
public class BookingStaffTransferAudit {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wash_session_id")
    private WashSession washSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_staff_id")
    private AuthUser fromStaff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_staff_id", nullable = false)
    private AuthUser toStaff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private AuthUser actor;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BookingStaffTransferAudit() {
    }

    public BookingStaffTransferAudit(
            CustomerBooking booking,
            WashSession washSession,
            AuthUser fromStaff,
            AuthUser toStaff,
            AuthUser actor,
            String reason
    ) {
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.washSession = washSession;
        this.fromStaff = fromStaff;
        this.toStaff = toStaff;
        this.actor = actor;
        this.reason = reason == null || reason.isBlank() ? null : reason.trim();
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public CustomerBooking getBooking() { return booking; }
    public WashSession getWashSession() { return washSession; }
    public AuthUser getFromStaff() { return fromStaff; }
    public AuthUser getToStaff() { return toStaff; }
    public AuthUser getActor() { return actor; }
    public String getReason() { return reason; }
    public Instant getCreatedAt() { return createdAt; }
}
