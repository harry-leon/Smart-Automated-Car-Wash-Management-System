package com.autowash.booking.dto;

public record AddonSelectionResponse(
        String addonId,
        String name,
        long price
) {
}
