package com.autowash.entity;

import com.autowash.enums.VehicleStatus;
import com.autowash.enums.VehicleType;

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
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerVehicle {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser owner;

    @Column(nullable = false, length = 20)
    private String plate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleType type;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "vehicle_year", nullable = false)
    private int year;

    @Column(length = 30)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleStatus status;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CustomerVehicle(
            AuthUser owner,
            String plate,
            VehicleType type,
            String brand,
            String model,
            int year,
            String color,
            boolean primary
    ) {
        Instant now = Instant.now();
        this.id = UUID.randomUUID();
        this.owner = owner;
        this.plate = plate;
        this.type = type;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.color = color;
        this.status = VehicleStatus.ACTIVE;
        this.primary = primary;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public UUID getId() { return id; }
    public AuthUser getOwner() { return owner; }
    public String getPlate() { return plate; }
    public VehicleType getType() { return type; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public int getYear() { return year; }
    public String getColor() { return color; }
    public VehicleStatus getStatus() { return status; }
    public boolean isPrimary() { return primary; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void updateDetails(String brand, String model, int year, String color) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.color = color;
        this.updatedAt = Instant.now();
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
        this.updatedAt = Instant.now();
    }

    public void softDelete() {
        this.status = VehicleStatus.DELETED;
        this.primary = false;
        this.updatedAt = Instant.now();
    }
}
