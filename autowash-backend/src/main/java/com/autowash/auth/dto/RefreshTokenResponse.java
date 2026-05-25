package com.autowash.auth.dto;

public record RefreshTokenResponse(
        String accessToken,
        long expiresIn
) {
}
