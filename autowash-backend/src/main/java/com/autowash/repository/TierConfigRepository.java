package com.autowash.repository;

import com.autowash.entity.TierConfig;
import com.autowash.entity.enums.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TierConfigRepository extends JpaRepository<TierConfig, LoyaltyTier> {
}
