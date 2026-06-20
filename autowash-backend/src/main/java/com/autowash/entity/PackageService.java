package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;
<<<<<<< HEAD
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
=======
>>>>>>> origin/feature/backend2-schema-entity-alignment

@Entity
@Table(name = "package_services")
@IdClass(PackageService.PackageServiceId.class)
<<<<<<< HEAD
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
=======
>>>>>>> origin/feature/backend2-schema-entity-alignment
public class PackageService {

    @Id
    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    @Id
    @Column(name = "option_id", nullable = false)
    private UUID optionId;

    @Column(name = "option_name", nullable = false, length = 100)
    private String optionName;

    @Column(name = "option_description", length = 500)
    private String optionDescription;

    @Column(name = "option_price", nullable = false)
    private long optionPrice;

    @Column(name = "option_duration_minutes", nullable = false)
    private int optionDurationMinutes;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

<<<<<<< HEAD
    @Getter
    @NoArgsConstructor
    public static class PackageServiceId implements Serializable {
        private UUID packageId;
        private UUID optionId;
=======
    protected PackageService() {
    }

    public UUID getPackageId() { return packageId; }
    public UUID getOptionId() { return optionId; }
    public String getOptionName() { return optionName; }
    public String getOptionDescription() { return optionDescription; }
    public long getOptionPrice() { return optionPrice; }
    public int getOptionDurationMinutes() { return optionDurationMinutes; }
    public int getQuantity() { return quantity; }
    public int getSortOrder() { return sortOrder; }

    public static class PackageServiceId implements Serializable {
        private UUID packageId;
        private UUID optionId;

        public PackageServiceId() {
        }
>>>>>>> origin/feature/backend2-schema-entity-alignment
    }
}
