package com.autowash.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record SendOtpRequest(
        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^0[0-9]{9}$", message = "Phone must start with 0 and be 10 digits")
        String phone
) {
}
