package com.autowash.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private int discountValue;

    @Column(name = "min_amount", nullable = false)
    private long minAmount;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "new_customer_only", nullable = false)
    private boolean newCustomerOnly;

    @Column(name = "target_tiers_csv", length = 100)
    private String targetTiersCsv;

    protected Voucher() {
    }

    public String getCode() { return code; }
    public DiscountType getDiscountType() { return discountType; }
    public int getDiscountValue() { return discountValue; }
    public long getMinAmount() { return minAmount; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isActive() { return active; }
    public boolean isNewCustomerOnly() { return newCustomerOnly; }
    public String getTargetTiersCsv() { return targetTiersCsv; }
}
