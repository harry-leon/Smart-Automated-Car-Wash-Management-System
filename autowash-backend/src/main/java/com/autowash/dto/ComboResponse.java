package com.autowash.dto;

import java.util.List;

public record ComboResponse(
        String comboId,
        String name,
        String description,
        long basePrice,
        Long originalPrice,
        int durationDays,
        int maxServices,
        List<String> benefits,
        List<ComboServiceItem> services,
        String image,
        boolean isActive,
        boolean canUpgrade,
        long upgradePriceFrom
) {
    public record ComboServiceItem(
            String serviceId,
            String name,
            String description,
            long price,
            int durationMinutes,
            int quantity,
            int sortOrder
    ) {
    }
}
