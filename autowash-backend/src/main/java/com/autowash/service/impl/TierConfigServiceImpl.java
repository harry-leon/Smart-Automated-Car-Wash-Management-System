package com.autowash.service.impl;

import com.autowash.dto.TierConfigRequest;
import com.autowash.dto.TierConfigResponse;
import com.autowash.entity.TierConfig;
import com.autowash.entity.enums.LoyaltyTier;
import com.autowash.repository.TierConfigRepository;
import com.autowash.service.TierConfigService;
import com.autowash.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class TierConfigServiceImpl implements TierConfigService {

    private final TierConfigRepository tierConfigRepository;

    public TierConfigServiceImpl(TierConfigRepository tierConfigRepository) {
        this.tierConfigRepository = tierConfigRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public TierConfigResponse getConfig(LoyaltyTier tier) {
        TierConfig config = tierConfigRepository.findById(tier)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tier config not found", "RESOURCE_NOT_FOUND"));
        return toResponse(config);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TierConfigResponse> getAllConfigs() {
        return tierConfigRepository.findAll().stream()
                .sorted(Comparator.comparingInt(TierConfig::getMinPoints))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TierConfigResponse updateConfig(LoyaltyTier tier, TierConfigRequest request) {
        TierConfig config = tierConfigRepository.findById(tier)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tier config not found", "RESOURCE_NOT_FOUND"));

        if (tier == LoyaltyTier.BRONZE && request.minPoints() != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BRONZE tier min points must be 0", "VALIDATION_ERROR");
        }

        config.update(
                request.minPoints(),
                BigDecimal.valueOf(request.pointMultiplier()),
                request.priorityScore()
        );

        return toResponse(tierConfigRepository.save(config));
    }

    @Override
    @Transactional(readOnly = true)
    public double getPointMultiplier(LoyaltyTier tier) {
        return tierConfigRepository.findById(tier)
                .map(config -> config.getPointMultiplier().doubleValue())
                .orElse(1.0);
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltyTier calculateTierForPoints(int totalEarnedPoints) {
        return tierConfigRepository.findAll().stream()
                .filter(config -> totalEarnedPoints >= config.getMinPoints())
                .max(Comparator.comparingInt(TierConfig::getMinPoints))
                .map(TierConfig::getTier)
                .orElse(LoyaltyTier.BRONZE);
    }

    @Override
    @Transactional(readOnly = true)
    public int getTierRank(LoyaltyTier tier) {
        List<TierConfig> configs = tierConfigRepository.findAll().stream()
                .sorted(Comparator.comparingInt(TierConfig::getMinPoints))
                .toList();
        for (int i = 0; i < configs.size(); i++) {
            if (configs.get(i).getTier() == tier) {
                return i;
            }
        }
        return 0; // fallback
    }

    private TierConfigResponse toResponse(TierConfig config) {
        return new TierConfigResponse(
                config.getTier().name(),
                config.getMinPoints(),
                config.getPointMultiplier().doubleValue(),
                config.getPriorityScore(),
                config.getUpdatedAt()
        );
    }
}
