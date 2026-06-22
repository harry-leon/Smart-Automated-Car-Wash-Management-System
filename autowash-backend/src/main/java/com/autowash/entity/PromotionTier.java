package com.autowash.entity;

import com.autowash.entity.enums.LoyaltyTier;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.io.Serializable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "promotion_tiers")
@IdClass(PromotionTier.PromotionTierId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PromotionTier {

    @Id
    private UUID promotionId;

    @Id
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "loyalty_tier")
    private LoyaltyTier tier;

    public PromotionTier(UUID promotionId, LoyaltyTier tier) {
        this.promotionId = promotionId;
        this.tier = tier;
    }

    @Getter
    @NoArgsConstructor
    public static class PromotionTierId implements Serializable {
        private UUID promotionId;
        private LoyaltyTier tier;
    }
}
