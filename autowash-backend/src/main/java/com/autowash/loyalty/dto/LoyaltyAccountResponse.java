package com.autowash.loyalty.dto;

public record LoyaltyAccountResponse(
        String customerId,
        String tier,
        int currentPoints,
        int totalEarnedPoints,
        int completedWashCount
) {
}
