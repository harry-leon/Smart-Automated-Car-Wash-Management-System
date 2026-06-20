package com.autowash.entity;

import com.autowash.entity.enums.PackageStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.UUID;

@Entity
@Table(name = "combos")
public class ServiceCombo {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private long price;

    @Column(name = "original_price")
    private Long originalPrice;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "max_usages")
    private Integer maxUsages;

    @Transient
    private String benefitsCsv;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status;

    @Transient
    private boolean canUpgrade;

    @Transient
    private long upgradePriceFrom;

    protected ServiceCombo() {
    }

    public String getId() { return id == null ? null : id.toString(); }
    public UUID getIdValue() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getBasePrice() { return price; }
    public Long getOriginalPrice() { return originalPrice; }
    public int getDurationMinutes() { return durationMinutes; }
    public int getDurationDays() { return durationDays == null ? 30 : durationDays; }
    public int getMaxServices() { return maxUsages == null ? 1 : maxUsages; }
    public String getBenefitsCsv() { return benefitsCsv; }
    public String getImageUrl() { return imageUrl; }
    public PackageStatus getStatus() { return status; }
    public boolean isActive() { return status == PackageStatus.ACTIVE; }
    public boolean isCanUpgrade() { return canUpgrade; }
    public long getUpgradePriceFrom() { return upgradePriceFrom; }
}
