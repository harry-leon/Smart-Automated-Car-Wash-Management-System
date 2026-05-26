package com.autowash.loyalty.entity;

import com.autowash.auth.entity.AuthUser;
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
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PointTransactionType type;

    @Column(nullable = false)
    private int points;

    @Column(name = "balance_after", nullable = false)
    private int balanceAfter;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PointTransaction() {
    }

    public PointTransaction(
            AuthUser customer,
            PointTransactionType type,
            int points,
            int balanceAfter,
            String reason,
            String referenceId
    ) {
        this.id = UUID.randomUUID();
        this.customer = customer;
        this.type = type;
        this.points = points;
        this.balanceAfter = balanceAfter;
        this.reason = reason;
        this.referenceId = referenceId;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public AuthUser getCustomer() { return customer; }
    public PointTransactionType getType() { return type; }
    public int getPoints() { return points; }
    public int getBalanceAfter() { return balanceAfter; }
    public String getReason() { return reason; }
    public String getReferenceId() { return referenceId; }
    public Instant getCreatedAt() { return createdAt; }
}
