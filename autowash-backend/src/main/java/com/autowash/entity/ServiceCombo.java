package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_combos")
public class ServiceCombo {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "base_price", nullable = false)
    private long basePrice;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "max_services", nullable = false)
    private int maxServices;

    @Column(name = "benefits_csv", length = 1000)
    private String benefitsCsv;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "can_upgrade", nullable = false)
    private boolean canUpgrade;

    @Column(name = "upgrade_price_from", nullable = false)
    private long upgradePriceFrom;

    protected ServiceCombo() {
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getBasePrice() { return basePrice; }
    public int getDurationDays() { return durationDays; }
    public int getMaxServices() { return maxServices; }
    public String getBenefitsCsv() { return benefitsCsv; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public boolean isCanUpgrade() { return canUpgrade; }
    public long getUpgradePriceFrom() { return upgradePriceFrom; }
}
