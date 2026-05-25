package com.autowash.auth.controller;

import com.autowash.auth.dto.LoginRequest;
import com.autowash.auth.dto.LoginResponse;
import com.autowash.auth.dto.LogoutRequest;
import com.autowash.auth.dto.RefreshTokenRequest;
import com.autowash.auth.dto.RefreshTokenResponse;
import com.autowash.auth.dto.RegisterRequest;
import com.autowash.auth.dto.RegisterResponse;
import com.autowash.auth.dto.SendOtpRequest;
import com.autowash.auth.dto.SendOtpResponse;
import com.autowash.auth.dto.VerifyOtpRequest;
import com.autowash.auth.service.AuthService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new customer account")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        "Registration successful. Please verify OTP.",
                        authService.register(request)
                ));
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send OTP for registration verification")
    public ApiResponse<SendOtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        return ApiResponse.ok("OTP sent successfully", authService.sendRegistrationOtp(request.phone()));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and activate account")
    public ApiResponse<LoginResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ApiResponse.ok("OTP verified. Account activated.", authService.verifyRegistrationOtp(request.phone(), request.otp()));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with phone and password")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ApiResponse<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok("Token refreshed", authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke refresh token")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.ok("Logout successful", null);
    }
}
