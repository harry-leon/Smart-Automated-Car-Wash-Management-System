package com.autowash.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SendOtpResponse(
        String phone,
        int otpExpiresIn,
        String maskedPhone,
        String message,
        String devOtp
) {
}
