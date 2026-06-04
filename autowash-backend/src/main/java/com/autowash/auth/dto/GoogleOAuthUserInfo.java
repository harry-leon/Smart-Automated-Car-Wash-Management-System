package com.autowash.auth.dto;

public record GoogleOAuthUserInfo(
        String subject,
        String email,
        String fullName,
        String avatarUrl,
        boolean emailVerified
) {
}
