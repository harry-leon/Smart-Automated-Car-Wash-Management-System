package com.autowash.auth.dto;

public record RegisterResponse(
        String userId,
        String phone,
        String fullName,
        String email,
        String status,
        boolean requiresOtpVerification,
        int otpExpiresIn,
        String devOtp
) {
}
