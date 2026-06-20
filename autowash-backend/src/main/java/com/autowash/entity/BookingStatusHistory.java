package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "booking_status_histories")
public class BookingStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @Column(name = "old_status", length = 30)
    private String oldStatus;

    @Column(name = "new_status", nullable = false, length = 30)
    private String newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private AuthUser changedBy;

    @Column
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected BookingStatusHistory() {
    }

    public BookingStatusHistory(CustomerBooking booking, String oldStatus, String newStatus, AuthUser changedBy, String reason) {
        this.booking = booking;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.reason = reason;
        this.changedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
