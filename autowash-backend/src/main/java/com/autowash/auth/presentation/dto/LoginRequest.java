package com.autowash.auth.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^0[0-9]{9}$", message = "Phone must start with 0 and contain exactly 10 digits")
        String phone,

        @NotBlank(message = "Password is required")
        String password
) {
}
