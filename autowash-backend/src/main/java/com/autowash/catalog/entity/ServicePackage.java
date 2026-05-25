package com.autowash.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_packages")
public class ServicePackage {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "base_price", nullable = false)
    private long basePrice;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(name = "features_csv", length = 1000)
    private String featuresCsv;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Popularity popularity;

    protected ServicePackage() {
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getBasePrice() { return basePrice; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getCategory() { return category; }
    public String getFeaturesCsv() { return featuresCsv; }
    public String getImageUrl() { return imageUrl; }
    public PackageStatus getStatus() { return status; }
    public Popularity getPopularity() { return popularity; }
}
