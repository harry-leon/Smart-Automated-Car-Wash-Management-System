package com.autowash.controller;

import com.autowash.dto.LoginRequest;
import com.autowash.dto.LoginResponse;
import com.autowash.dto.GoogleAuthLinkRequest;
import com.autowash.dto.GoogleAuthTicketExchangeRequest;
import com.autowash.dto.GoogleAuthTicketResponse;
import com.autowash.dto.LogoutRequest;
import com.autowash.dto.RefreshTokenRequest;
import com.autowash.dto.RefreshTokenResponse;
import com.autowash.dto.RegisterRequest;
import com.autowash.dto.RegisterResponse;
import com.autowash.dto.SendOtpRequest;
import com.autowash.dto.SendOtpResponse;
import com.autowash.dto.VerifyOtpRequest;
import com.autowash.service.AuthService;
import com.autowash.service.GoogleAuthService;
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
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
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
        return ApiResponse.ok("OTP sent successfully", authService.sendRegistrationOtp(request.email(), request.phone(), metadata(servletRequest)));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and activate account")
    public ApiResponse<LoginResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.ok("OTP verified. Account activated.", authService.verifyRegistrationOtp(request.email(), request.phone(), request.otp(), metadata(servletRequest)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with phone and password")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }

    @GetMapping("/google/start")
    @Operation(summary = "Start Google OAuth login flow")
    public RedirectView startGoogle(@RequestParam(name = "returnUrl", required = false) String returnUrl) {
        return new RedirectView(googleAuthService.start(returnUrl));
    }

    @GetMapping("/google/callback")
    @Operation(summary = "Handle Google OAuth callback")
    public RedirectView googleCallback(
            @RequestParam(name = "code", required = false) String code,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "error", required = false) String error,
            @RequestParam(name = "error_description", required = false) String errorDescription
    ) {
        return new RedirectView(googleAuthService.handleCallback(code, state, error, errorDescription));
    }

    @GetMapping("/google/tickets/{state}")
    @Operation(summary = "Inspect Google OAuth ticket state")
    public ApiResponse<GoogleAuthTicketResponse> getGoogleTicket(@PathVariable String state) {
        return ApiResponse.ok("Google ticket retrieved", googleAuthService.getTicket(state));
    }

    @PostMapping("/google/tickets/exchange")
    @Operation(summary = "Exchange a ready Google ticket for auth session")
    public ApiResponse<LoginResponse> exchangeGoogleTicket(@Valid @RequestBody GoogleAuthTicketExchangeRequest request) {
        return ApiResponse.ok("Google login successful", googleAuthService.exchangeReadyTicket(request.state()));
    }

    @PostMapping("/google/tickets/link")
    @Operation(summary = "Confirm auto-link for an existing account")
    public ApiResponse<LoginResponse> confirmGoogleLink(@Valid @RequestBody GoogleAuthLinkRequest request) {
        return ApiResponse.ok("Google account linked successfully", googleAuthService.confirmLink(request.state()));
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
