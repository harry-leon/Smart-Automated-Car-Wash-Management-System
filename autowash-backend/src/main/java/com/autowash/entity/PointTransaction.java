package com.autowash.entity;

import com.autowash.entity.enums.PointTransactionType;
import com.autowash.entity.AuthUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loyalty_account_id", nullable = false)
    private LoyaltyAccount loyaltyAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private CustomerBooking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PointTransactionType type;

    @Column(nullable = false)
    private int points;

    @Column(name = "balance_after", nullable = false)
    private int balanceAfter;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PointTransaction() {
    }

    public PointTransaction(
            LoyaltyAccount loyaltyAccount,
            PointTransactionType type,
            int points,
            int balanceAfter,
            String reason,
            CustomerBooking booking
    ) {
        this.loyaltyAccount = loyaltyAccount;
        this.booking = booking;
        this.type = type;
        this.points = points;
        this.balanceAfter = balanceAfter;
        this.reason = reason;
        this.createdAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public LoyaltyAccount getLoyaltyAccount() { return loyaltyAccount; }
    public AuthUser getCustomer() { return loyaltyAccount.getCustomer(); }
    public CustomerBooking getBooking() { return booking; }
    public PointTransactionType getType() { return type; }
    public int getPoints() { return points; }
    public int getBalanceAfter() { return balanceAfter; }
    public String getReason() { return reason; }
    public String getReferenceId() { return booking == null ? null : booking.getId(); }
    public Instant getCreatedAt() { return createdAt; }
}
