package com.autowash.catalog.dto;

import java.util.List;

public record AddonResponse(
        String addonId,
        String name,
        String description,
        long price,
        int duration,
        String category,
        String image,
        List<String> applicableToPackages,
        String status
) {
}
