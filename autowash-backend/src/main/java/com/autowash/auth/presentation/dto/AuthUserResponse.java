package com.autowash.auth.presentation.dto;

import com.autowash.auth.domain.AuthUser;
import com.autowash.auth.domain.UserRole;
import com.autowash.auth.domain.UserStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthUserResponse(
        UUID userId,
        String fullName,
        String phone,
        String email,
        UserRole role,
        UserStatus status,
        String tier,
        Instant createdAt
) {

    public static AuthUserResponse from(AuthUser user) {
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getRole() == UserRole.CUSTOMER ? "MEMBER" : null,
                user.getCreatedAt()
        );
    }
}
