package com.autowash.repository;

import com.autowash.entity.PromotionTier;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionTierRepository extends JpaRepository<PromotionTier, PromotionTier.PromotionTierId> {
    List<PromotionTier> findByPromotionId(UUID promotionId);

    void deleteByPromotionId(UUID promotionId);
}
