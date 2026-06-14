package com.autowash.dto;

public record AddonSelectionResponse(
        String addonId,
        String name,
        long price
) {
}
