package com.autowash.operation;

import static org.assertj.core.api.Assertions.assertThat;

import com.autowash.auth.entity.LoyaltyTier;
import com.autowash.operation.service.LoyaltyPointService;
import org.junit.jupiter.api.Test;

class LoyaltyPointServiceTest {

    @Test
    void calculatesProjectedPointsUsingConfiguredUnitAndTierMultiplier() {
        LoyaltyPointService service = new LoyaltyPointService(10000);

        assertThat(service.calculateProjectedPoints(270000, LoyaltyTier.MEMBER)).isEqualTo(27);
        assertThat(service.calculateProjectedPoints(270000, LoyaltyTier.GOLD)).isEqualTo(40);
    }
}
