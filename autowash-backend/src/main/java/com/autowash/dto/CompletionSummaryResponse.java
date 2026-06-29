package com.autowash.dto;

import java.time.Instant;
import java.util.List;

public record CompletionSummaryResponse(
        String bookingId,
        String washSessionId,
        String status,
        int awardedPoints,
        int currentPoints,
        String currentTier,
        Instant completedAt,
        List<CustomerPromotionResponse> availablePromotions
) {
}
