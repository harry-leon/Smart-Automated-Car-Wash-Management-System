package com.autowash.entity;

import com.autowash.entity.enums.LoyaltyTier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tier_configs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TierConfig {

    @Id
    @Enumerated(EnumType.STRING)
    private LoyaltyTier tier;

    @Column(name = "min_points", nullable = false)
    private int minPoints;

    @Column(name = "point_multiplier", nullable = false)
    private BigDecimal pointMultiplier;

    @Column(name = "priority_score", nullable = false)
    private int priorityScore;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public void update(int minPoints, BigDecimal pointMultiplier, int priorityScore) {
        this.minPoints = minPoints;
        this.pointMultiplier = pointMultiplier;
        this.priorityScore = priorityScore;
        this.updatedAt = Instant.now();
    }
}
