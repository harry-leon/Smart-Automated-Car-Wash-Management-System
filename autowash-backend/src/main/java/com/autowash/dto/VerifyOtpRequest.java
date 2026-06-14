package com.autowash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyOtpRequest(
        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^0[0-9]{9}$", message = "Phone must start with 0 and be 10 digits")
        String phone,

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
        String otp
) {
}
