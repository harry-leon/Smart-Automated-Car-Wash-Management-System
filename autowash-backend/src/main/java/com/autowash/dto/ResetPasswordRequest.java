package com.autowash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "OTP is required")
        @jakarta.validation.constraints.Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
        String otp,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 72, message = "New password must be between 8 and 72 characters")
        String newPassword,

        @NotBlank(message = "New password confirmation is required")
        String newPasswordConfirm
) {
}
