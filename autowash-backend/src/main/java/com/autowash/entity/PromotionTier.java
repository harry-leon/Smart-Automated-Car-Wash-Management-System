package com.autowash.entity;

import com.autowash.enums.LoyaltyTier;
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
@Table(name = "promotion_tiers")
@IdClass(PromotionTier.PromotionTierId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PromotionTier {

    @Id
    private UUID promotionId;

    @Id
    private LoyaltyTier tier;

    @Getter
    @NoArgsConstructor
    public static class PromotionTierId implements Serializable {
        private UUID promotionId;
        private LoyaltyTier tier;
    }
}
