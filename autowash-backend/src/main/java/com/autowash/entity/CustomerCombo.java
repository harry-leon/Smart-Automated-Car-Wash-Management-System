package com.autowash.entity;

import com.autowash.entity.AuthUser;
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

@Entity
@Table(name = "customer_combos")
public class CustomerCombo {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser customer;

    @Column(name = "combo_id", nullable = false, length = 50)
    private String comboId;

    @Column(name = "purchase_booking_id", length = 50)
    private String purchaseBookingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerComboStatus status;

    @Column(name = "total_usages", nullable = false)
    private int totalUsages;

    @Column(name = "remaining_usages", nullable = false)
    private int remainingUsages;

    @Column(name = "activated_at", nullable = false)
    private Instant activatedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected CustomerCombo() {
    }

    public CustomerCombo(
            String id,
            AuthUser customer,
            String comboId,
            String purchaseBookingId,
            int totalUsages,
            Instant activatedAt,
            Instant expiresAt
    ) {
        this.id = id;
        this.customer = customer;
        this.comboId = comboId;
        this.purchaseBookingId = purchaseBookingId;
        this.status = CustomerComboStatus.ACTIVE;
        this.totalUsages = totalUsages;
        this.remainingUsages = totalUsages;
        this.activatedAt = activatedAt;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public String getId() { return id; }
    public AuthUser getCustomer() { return customer; }
    public String getComboId() { return comboId; }
    public String getPurchaseBookingId() { return purchaseBookingId; }
    public CustomerComboStatus getStatus() { return status; }
    public int getTotalUsages() { return totalUsages; }
    public int getRemainingUsages() { return remainingUsages; }
    public Instant getActivatedAt() { return activatedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public boolean isActive() {
        return status == CustomerComboStatus.ACTIVE;
    }

    public boolean isExpired() {
        return expiresAt.isBefore(Instant.now());
    }

    public boolean hasRemainingUsages() {
        return remainingUsages > 0;
    }

    public void consumeUsage() {
        if (remainingUsages <= 0) {
            throw new IllegalStateException("Combo has no remaining usages");
        }
        remainingUsages--;
        lastUsedAt = Instant.now();
        updatedAt = lastUsedAt;
        if (remainingUsages == 0) {
            status = CustomerComboStatus.EXHAUSTED;
        }
    }

    public void markExpired() {
        status = CustomerComboStatus.EXPIRED;
        updatedAt = Instant.now();
    }
}
