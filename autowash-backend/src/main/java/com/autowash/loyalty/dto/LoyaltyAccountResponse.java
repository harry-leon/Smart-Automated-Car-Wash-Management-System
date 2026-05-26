package com.autowash.loyalty.dto;

import java.time.Instant;
import java.util.UUID;

public record LoyaltyAccountResponse(
        UUID customerId,
        int currentPoints,
        String tier,
        Instant updatedAt
) {
}
