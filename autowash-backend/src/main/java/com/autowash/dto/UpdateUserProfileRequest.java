package com.autowash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^0[0-9]{9}$", message = "Phone must start with 0 and be 10 digits")
        String phone
) {
}
