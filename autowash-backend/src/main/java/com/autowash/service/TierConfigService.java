package com.autowash.service;

import com.autowash.dto.TierConfigRequest;
import com.autowash.dto.TierConfigResponse;
import com.autowash.entity.enums.LoyaltyTier;
import java.util.List;

public interface TierConfigService {
    TierConfigResponse getConfig(LoyaltyTier tier);
    List<TierConfigResponse> getAllConfigs();
    TierConfigResponse updateConfig(LoyaltyTier tier, TierConfigRequest request);
    double getPointMultiplier(LoyaltyTier tier);
    LoyaltyTier calculateTierForPoints(int totalEarnedPoints);
    int getTierRank(LoyaltyTier tier);
}
