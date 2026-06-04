package com.autowash.auth.dto;

public record LoginResponse(
        String userId,
        String fullName,
        String phone,
        String email,
        String role,
        String status,
        String tier,
        int loyaltyBalance,
        boolean isNewCustomer,
        String accessToken,
        String refreshToken,
        long expiresIn
) {
}
