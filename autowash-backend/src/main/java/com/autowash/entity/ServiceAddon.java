package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_addons")
public class ServiceAddon {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private long price;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "applicable_packages_csv", length = 500)
    private String applicablePackagesCsv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status;

    protected ServiceAddon() {
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getPrice() { return price; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public String getApplicablePackagesCsv() { return applicablePackagesCsv; }
    public PackageStatus getStatus() { return status; }
}
