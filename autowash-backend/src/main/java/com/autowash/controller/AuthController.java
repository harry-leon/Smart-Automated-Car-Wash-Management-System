package com.autowash.controller;

import com.autowash.dto.ForgotPasswordRequest;
import com.autowash.dto.LoginRequest;
import com.autowash.dto.LoginResponse;
import com.autowash.dto.LogoutRequest;
import com.autowash.dto.RefreshTokenRequest;
import com.autowash.dto.RefreshTokenResponse;
import com.autowash.dto.RegisterRequest;
import com.autowash.dto.RegisterResponse;
import com.autowash.dto.ResetPasswordRequest;
import com.autowash.dto.SendOtpRequest;
import com.autowash.dto.SendOtpResponse;
import com.autowash.dto.VerifyOtpRequest;
import com.autowash.service.AuthService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        "Registration successful. Please verify the OTP sent to your email.",
                        authService.register(request, metadata(servletRequest))
                ));
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send OTP for registration verification")
    public ApiResponse<SendOtpResponse> sendOtp(
            @Valid @RequestBody SendOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.ok("OTP sent successfully", authService.sendRegistrationOtp(request.email(), metadata(servletRequest)));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and activate account")
    public ApiResponse<LoginResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.ok("OTP verified. Account activated.", authService.verifyRegistrationOtp(request.email(), request.otp(), metadata(servletRequest)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @PostMapping("/forgot-password/request")
    @Operation(summary = "Send OTP for password reset")
    public ApiResponse<SendOtpResponse> requestForgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.ok(
                "Password reset OTP sent successfully",
                authService.requestForgotPassword(request.email(), metadata(servletRequest))
        );
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Reset password with OTP")
    public ApiResponse<Void> resetForgotPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        authService.resetForgotPassword(
                request.email(),
                request.otp(),
                request.newPassword(),
                request.newPasswordConfirm(),
                metadata(servletRequest)
        );
        return ApiResponse.ok("Password reset successful", null);
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

    private AuthService.RequestMetadata metadata(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String requestIp = forwardedFor == null || forwardedFor.isBlank()
                ? request.getRemoteAddr()
                : forwardedFor.split(",")[0].trim();
        return new AuthService.RequestMetadata(
                requestIp,
                request.getHeader("User-Agent"),
                request.getHeader("X-Device-Fingerprint")
        );
    }
}
