package com.autowash.entity;

import com.autowash.entity.enums.ActiveStatus;
import com.autowash.entity.enums.PromotionTargetingMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "promotions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Promotion {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "point_multiplier", nullable = false, precision = 4, scale = 2)
    private BigDecimal pointMultiplier;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "targeting_mode", nullable = false, columnDefinition = "promotion_targeting_mode")
    private PromotionTargetingMode targetingMode;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "active_status")
    private ActiveStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Promotion(String name, String description, BigDecimal pointMultiplier, Instant startAt, Instant endAt, PromotionTargetingMode targetingMode, ActiveStatus status) {
        this.name = name;
        this.description = description;
        this.pointMultiplier = pointMultiplier;
        this.startAt = startAt;
        this.endAt = endAt;
        this.targetingMode = targetingMode;
        this.status = status;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String name, String description, BigDecimal pointMultiplier, Instant startAt, Instant endAt, PromotionTargetingMode targetingMode, ActiveStatus status) {
        this.name = name;
        this.description = description;
        this.pointMultiplier = pointMultiplier;
        this.startAt = startAt;
        this.endAt = endAt;
        this.targetingMode = targetingMode;
        this.status = status;
        this.updatedAt = Instant.now();
    }
}
