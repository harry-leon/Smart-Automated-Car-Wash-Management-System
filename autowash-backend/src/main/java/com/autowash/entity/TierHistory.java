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
@Table(name = "tier_histories")
public class TierHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loyalty_account_id", nullable = false)
    private LoyaltyAccount loyaltyAccount;

    @Column(name = "old_tier", length = 20)
    private String oldTier;

    @Column(name = "new_tier", nullable = false, length = 20)
    private String newTier;

    @Column(name = "total_points_at_change", nullable = false)
    private int totalPointsAtChange;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected TierHistory() {
    }

    public TierHistory(LoyaltyAccount loyaltyAccount, String oldTier, String newTier, int totalPointsAtChange) {
        this.loyaltyAccount = loyaltyAccount;
        this.oldTier = oldTier;
        this.newTier = newTier;
        this.totalPointsAtChange = totalPointsAtChange;
        this.changedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
