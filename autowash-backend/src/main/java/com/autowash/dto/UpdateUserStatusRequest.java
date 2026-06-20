package com.autowash.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserStatusRequest(
        @NotBlank(message = "status is required")
        String status
) {
}
