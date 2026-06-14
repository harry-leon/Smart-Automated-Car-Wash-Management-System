package com.autowash.entity;

import com.autowash.entity.AuthUser;
import com.autowash.entity.LoyaltyTier;
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
@Table(name = "loyalty_accounts")
public class LoyaltyAccount {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private AuthUser customer;

    @Column(name = "current_points", nullable = false)
    private int currentPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoyaltyTier tier;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected LoyaltyAccount() {
    }

    public LoyaltyAccount(AuthUser customer) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.customer = customer;
        this.currentPoints = 0;
        this.tier = LoyaltyTier.MEMBER;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public UUID getId() { return id; }
    public AuthUser getCustomer() { return customer; }
    public int getCurrentPoints() { return currentPoints; }
    public LoyaltyTier getTier() { return tier; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void addPoints(int points) {
        this.currentPoints += points;
        this.updatedAt = Instant.now();
    }

    public void redeemPoints(int points) {
        this.currentPoints -= points;
        this.updatedAt = Instant.now();
    }

    public void updateTier(LoyaltyTier tier) {
        this.tier = tier;
        this.updatedAt = Instant.now();
    }
}
