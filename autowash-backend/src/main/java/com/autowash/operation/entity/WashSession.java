package com.autowash.operation.entity;

import com.autowash.booking.entity.CustomerBooking;
import com.autowash.operation.service.WashSessionLifecycle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wash_sessions")
public class WashSession {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private CustomerBooking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WashSessionStatus status;

    @Column(length = 500)
    private String notes;

    @Column(name = "fee_amount")
    private Long feeAmount;

    @Column(name = "fee_currency", length = 10)
    private String feeCurrency;

    @Column(name = "projected_loyalty_points")
    private Integer projectedLoyaltyPoints;

    @Column(name = "awarded_loyalty_points")
    private Integer awardedLoyaltyPoints;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "queued_at")
    private Instant queuedAt;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected WashSession() {
    }

    public WashSession(CustomerBooking booking, String notes) {
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.notes = notes;
        this.status = WashSessionStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public CustomerBooking getBooking() { return booking; }
    public WashSessionStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public Long getFeeAmount() { return feeAmount; }
    public String getFeeCurrency() { return feeCurrency; }
    public Integer getProjectedLoyaltyPoints() { return projectedLoyaltyPoints; }
    public Integer getAwardedLoyaltyPoints() { return awardedLoyaltyPoints; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getQueuedAt() { return queuedAt; }
    public Instant getCheckedInAt() { return checkedInAt; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }

    public void queue(Instant queuedAt) {
        transitionTo(WashSessionStatus.QUEUED);
        this.queuedAt = queuedAt;
    }

    public void checkIn(Instant checkedInAt, long feeAmount, String feeCurrency, int projectedLoyaltyPoints) {
        transitionTo(WashSessionStatus.CHECKED_IN);
        this.checkedInAt = checkedInAt;
        this.feeAmount = feeAmount;
        this.feeCurrency = feeCurrency;
        this.projectedLoyaltyPoints = projectedLoyaltyPoints;
    }

    public void start(Instant startedAt) {
        transitionTo(WashSessionStatus.IN_PROGRESS);
        this.startedAt = startedAt;
    }

    public void complete(Instant completedAt, int awardedLoyaltyPoints) {
        transitionTo(WashSessionStatus.COMPLETED);
        this.completedAt = completedAt;
        this.awardedLoyaltyPoints = awardedLoyaltyPoints;
    }

    private void transitionTo(WashSessionStatus next) {
        WashSessionLifecycle.validateTransition(status, next);
        this.status = next;
    }
}
