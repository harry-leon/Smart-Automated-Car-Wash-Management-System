package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private int discountValue;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "targeting_mode", nullable = false, length = 30)
    private PromotionTargetingMode targetingMode;

    @Column(name = "applicable_tiers_csv", length = 100)
    private String applicableTiersCsv;

    @Column(name = "max_usage_per_customer")
    private Integer maxUsagePerCustomer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromotionStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Promotion() {
    }

    public Promotion(
            String name,
            String description,
            DiscountType discountType,
            int discountValue,
            Instant startDate,
            Instant endDate,
            PromotionTargetingMode targetingMode,
            String applicableTiersCsv,
            Integer maxUsagePerCustomer,
            PromotionStatus status
    ) {
        this.name = name;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetingMode = targetingMode;
        this.applicableTiersCsv = applicableTiersCsv;
        this.maxUsagePerCustomer = maxUsagePerCustomer;
        this.status = status == null ? PromotionStatus.ACTIVE : status;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = "promo_" + UUID.randomUUID().toString().replace("-", "");
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public DiscountType getDiscountType() { return discountType; }
    public int getDiscountValue() { return discountValue; }
    public Instant getStartDate() { return startDate; }
    public Instant getEndDate() { return endDate; }
    public PromotionTargetingMode getTargetingMode() { return targetingMode; }
    public String getApplicableTiersCsv() { return applicableTiersCsv; }
    public Integer getMaxUsagePerCustomer() { return maxUsagePerCustomer; }
    public PromotionStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void update(
            String name,
            String description,
            DiscountType discountType,
            int discountValue,
            Instant startDate,
            Instant endDate,
            PromotionTargetingMode targetingMode,
            String applicableTiersCsv,
            Integer maxUsagePerCustomer,
            PromotionStatus status
    ) {
        this.name = name;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetingMode = targetingMode;
        this.applicableTiersCsv = applicableTiersCsv;
        this.maxUsagePerCustomer = maxUsagePerCustomer;
        this.status = status == null ? PromotionStatus.ACTIVE : status;
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.status = PromotionStatus.INACTIVE;
        this.updatedAt = Instant.now();
    }
}
