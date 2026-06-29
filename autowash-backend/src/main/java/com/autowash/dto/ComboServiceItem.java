package com.autowash.dto;

public record ComboServiceItem(
        String serviceId,
        String name,
        String description,
        long price,
        int durationMinutes,
        int quantity,
        int sortOrder
) {}