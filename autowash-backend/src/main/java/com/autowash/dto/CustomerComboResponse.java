package com.autowash.dto;

import java.time.Instant;

public record CustomerComboResponse(
        String customerComboId,
        String comboId,
        String comboName,
        String status,
        int totalUsages,
        int remainingUsages,
        Instant activatedAt,
        Instant expiresAt,
        Instant lastUsedAt
) {
}
