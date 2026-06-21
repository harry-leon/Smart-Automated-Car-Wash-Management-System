package com.autowash.entity;

import com.autowash.entity.enums.LoyaltyTier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tier_histories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TierHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "loyalty_account_id", nullable = false)
    private LoyaltyAccount loyaltyAccount;

    @Column(name = "old_tier", length = 20)
    @Enumerated(EnumType.STRING)
    private LoyaltyTier oldTier;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "new_tier", nullable = false, columnDefinition = "loyalty_tier")
    private LoyaltyTier newTier;

    @Column(name = "total_points_at_change", nullable = false)
    private int totalPointsAtChange;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    public TierHistory(LoyaltyAccount loyaltyAccount, LoyaltyTier oldTier, LoyaltyTier newTier, int totalPointsAtChange) {
        this.loyaltyAccount = loyaltyAccount;
        this.oldTier = oldTier;
        this.newTier = newTier;
        this.totalPointsAtChange = totalPointsAtChange;
        this.changedAt = Instant.now();
    }
}
