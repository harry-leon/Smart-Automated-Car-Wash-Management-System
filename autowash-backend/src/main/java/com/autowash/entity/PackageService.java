package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "package_services")
@IdClass(PackageService.PackageServiceId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

    @Getter
    @NoArgsConstructor
    public static class PackageServiceId implements Serializable {
        private UUID packageId;
        private UUID optionId;
    }
}
