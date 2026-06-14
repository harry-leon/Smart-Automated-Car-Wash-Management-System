package com.autowash.dto;

public record GoogleOAuthUserInfo(
        String subject,
        String email,
        String fullName,
        String avatarUrl,
        boolean emailVerified
) {
}
