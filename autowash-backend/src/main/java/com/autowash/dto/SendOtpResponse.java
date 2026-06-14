package com.autowash.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SendOtpResponse(
        String email,
        String phone,
        int otpExpiresIn,
        String maskedEmail,
        String maskedPhone,
        String message,
        String devOtp
) {
}
