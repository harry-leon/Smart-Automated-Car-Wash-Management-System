package com.autowash.dto;

public record BookingOptionResponse(
        String optionId,
        String name,
        long price
) {
}
