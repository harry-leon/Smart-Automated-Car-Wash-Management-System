package com.autowash.dto;

public record RegisterResponse(
        String userId,
        String fullName,
        String email,
        String status,
        boolean requiresOtpVerification,
        int otpExpiresIn,
        String devOtp
) {
}
