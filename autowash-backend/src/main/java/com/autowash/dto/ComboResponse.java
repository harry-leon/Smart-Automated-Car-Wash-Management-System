package com.autowash.dto;

import java.util.List;

public record ComboResponse(
        String comboId,
        String name,
        String description,
        long basePrice,
        int durationDays,
        int maxServices,
        List<String> benefits,
        String image,
        boolean isActive,
        boolean canUpgrade,
        long upgradePriceFrom
) {
}
