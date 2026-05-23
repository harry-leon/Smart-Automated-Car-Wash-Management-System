package com.autowash.auth.presentation.dto;

import com.autowash.auth.domain.AuthUser;
import com.autowash.auth.domain.UserRole;
import com.autowash.auth.domain.UserStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
        UUID userId,
        String fullName,
        String phone,
        String email,
        UserRole role,
        UserStatus status,
        String tier,
        String accessToken,
        String tokenType,
        long expiresIn
) {

    public static LoginResponse from(AuthUser user, String accessToken, long expiresIn) {
        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getRole() == UserRole.CUSTOMER ? "MEMBER" : null,
                accessToken,
                "Bearer",
                expiresIn
        );
    }
}
