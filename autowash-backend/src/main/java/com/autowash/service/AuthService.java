package com.autowash.service;

import com.autowash.dto.LoginRequest;
import com.autowash.dto.LoginResponse;
import com.autowash.dto.RefreshTokenResponse;
import com.autowash.dto.RegisterRequest;
import com.autowash.dto.RegisterResponse;
import com.autowash.dto.SendOtpResponse;
import com.autowash.entity.RefreshToken;
import com.autowash.entity.User;

public interface AuthService {
    RegisterResponse register(RegisterRequest request, RequestMetadata metadata);
    SendOtpResponse sendRegistrationOtp(String email, RequestMetadata metadata);
    LoginResponse verifyRegistrationOtp(String email, String otp, RequestMetadata metadata);
    LoginResponse login(LoginRequest request);
    SendOtpResponse requestForgotPassword(String email, RequestMetadata metadata);
    void resetForgotPassword(String email, String otp, String newPassword, String newPasswordConfirm, RequestMetadata metadata);
    RefreshTokenResponse refresh(String token);
    void logout(String token);
    RefreshToken createRefreshToken(User user);

    record RequestMetadata(String requestIp, String userAgent, String deviceFingerprint) {
    }
}
