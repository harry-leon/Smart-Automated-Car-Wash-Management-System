package com.autowash.dto;

import java.math.BigDecimal;

public record SystemSettingsResponse(
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
        BigDecimal platinumMultiplier,
        String updatedAt
) {
}
