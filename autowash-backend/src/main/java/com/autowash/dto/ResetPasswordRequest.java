package com.autowash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^0[0-9]{9}$", message = "Phone must start with 0 and be 10 digits")
        String phone,

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
        String otp,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 72, message = "New password must be between 8 and 72 characters")
        String newPassword,

        @NotBlank(message = "New password confirmation is required")
        String newPasswordConfirm
) {
}
