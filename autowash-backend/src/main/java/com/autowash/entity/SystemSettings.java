package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SystemSettings {

    @Id
    private int id = 1;

    @Column(name = "operating_start_time", nullable = false, length = 5)
    private String operatingStartTime = "08:00";

    @Column(name = "operating_end_time", nullable = false, length = 5)
    private String operatingEndTime = "20:00";

    @Column(name = "max_advance_booking_days", nullable = false)
    private int maxAdvanceBookingDays = 30;

    @Column(name = "no_show_grace_minutes", nullable = false)
    private int noShowGraceMinutes = 15;

    @Column(nullable = false, length = 10)
    private String currency = "VND";

    @Column(name = "earn_points_unit_amount", nullable = false)
    private int earnPointsUnitAmount = 10_000;

    @Column(name = "vnd_per_point", nullable = false)
    private int vndPerPoint = 1_000;

    @Column(name = "min_redemption_points", nullable = false)
    private int minRedemptionPoints = 50;

    @Column(name = "max_redemption_points", nullable = false)
    private int maxRedemptionPoints = 200;

    @Column(name = "silver_threshold", nullable = false)
    private int silverThreshold = 500;

    @Column(name = "gold_threshold", nullable = false)
    private int goldThreshold = 1_500;

    @Column(name = "platinum_threshold", nullable = false)
    private int platinumThreshold = 4_000;

    @Column(name = "silver_multiplier", nullable = false)
    private BigDecimal silverMultiplier = new BigDecimal("1.2");

    @Column(name = "gold_multiplier", nullable = false)
    private BigDecimal goldMultiplier = new BigDecimal("1.5");

    @Column(name = "platinum_multiplier", nullable = false)
    private BigDecimal platinumMultiplier = new BigDecimal("2.0");

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public void update(
            String operatingStartTime,
            String operatingEndTime,
            int maxAdvanceBookingDays,
            int noShowGraceMinutes,
            String currency,
            int earnPointsUnitAmount,
            int vndPerPoint,
            int minRedemptionPoints,
            int maxRedemptionPoints,
            int silverThreshold,
            int goldThreshold,
            int platinumThreshold,
            BigDecimal silverMultiplier,
            BigDecimal goldMultiplier,
            BigDecimal platinumMultiplier
    ) {
        this.operatingStartTime = operatingStartTime;
        this.operatingEndTime = operatingEndTime;
        this.maxAdvanceBookingDays = maxAdvanceBookingDays;
        this.noShowGraceMinutes = noShowGraceMinutes;
        this.currency = currency;
        this.earnPointsUnitAmount = earnPointsUnitAmount;
        this.vndPerPoint = vndPerPoint;
        this.minRedemptionPoints = minRedemptionPoints;
        this.maxRedemptionPoints = maxRedemptionPoints;
        this.silverThreshold = silverThreshold;
        this.goldThreshold = goldThreshold;
        this.platinumThreshold = platinumThreshold;
        this.silverMultiplier = silverMultiplier;
        this.goldMultiplier = goldMultiplier;
        this.platinumMultiplier = platinumMultiplier;
        this.updatedAt = Instant.now();
    }
}
