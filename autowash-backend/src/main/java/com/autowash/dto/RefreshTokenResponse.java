package com.autowash.dto;

public record RefreshTokenResponse(
        String accessToken,
        long expiresIn
) {
}
