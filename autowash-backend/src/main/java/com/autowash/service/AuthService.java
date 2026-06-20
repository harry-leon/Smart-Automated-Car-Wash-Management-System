package com.autowash.service;

import com.autowash.dto.LoginRequest;
import com.autowash.dto.LoginResponse;
import com.autowash.dto.RefreshTokenResponse;
import com.autowash.dto.RegisterRequest;
import com.autowash.dto.RegisterResponse;
import com.autowash.dto.SendOtpResponse;
import com.autowash.entity.User;
import com.autowash.entity.enums.OtpPurpose;
import com.autowash.entity.OtpVerification;
import com.autowash.entity.RefreshToken;
import com.autowash.entity.enums.UserStatus;
import com.autowash.repository.UserRepository;
import com.autowash.repository.OtpVerificationRepository;
import com.autowash.repository.RefreshTokenRepository;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final String PHONE_PATTERN = "^0[0-9]{9}$";

    private final UserRepository UserRepository;
    private final OtpVerificationRepository OtpVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailDeliveryService emailDeliveryService;
    private final JwtService jwtService;
    private final long otpExpirationSeconds;
    private final int otpMaxAttempts;
    private final long refreshTokenExpirationSeconds;
    private final boolean otpExposeForDev;

    public AuthService(
            UserRepository UserRepository,
            OtpVerificationRepository OtpVerificationRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            EmailDeliveryService emailDeliveryService,
            JwtService jwtService,
            @Value("${autowash.auth.otp.expiration-seconds}") long otpExpirationSeconds,
            @Value("${autowash.auth.otp.max-attempts}") int otpMaxAttempts,
            @Value("${autowash.auth.jwt.refresh-token-expiration-seconds}") long refreshTokenExpirationSeconds,
            @Value("${autowash.auth.otp.expose-for-dev}") boolean otpExposeForDev
    ) {
        this.UserRepository = UserRepository;
        this.OtpVerificationRepository = OtpVerificationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailDeliveryService = emailDeliveryService;
        this.jwtService = jwtService;
        this.otpExpirationSeconds = otpExpirationSeconds;
        this.otpMaxAttempts = otpMaxAttempts;
        this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
        this.otpExposeForDev = otpExposeForDev;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request, RequestMetadata metadata) {
        if (UserRepository.existsByPhone(request.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already registered", "DUPLICATE_PHONE");
        }
        if (UserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered", "DUPLICATE_EMAIL");
        }

        User user = new User(
                request.fullName(),
                request.phone(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        UserRepository.save(user);
        SendOtpResponse otpResponse = issueRegistrationOtp(user, metadata, false);

        return new RegisterResponse(
                user.getId().toString(),
                user.getPhone(),
                user.getFullName(),
                user.getEmail(),
                user.getStatus().name(),
                true,
                (int) otpExpirationSeconds,
                otpResponse.devOtp()
        );
    }

    @Transactional
    public SendOtpResponse sendRegistrationOtp(String email, String phone, RequestMetadata metadata) {
        User user = resolveOtpUser(email, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);
        enforceResendLimit(user);

        return issueRegistrationOtp(user, metadata, true);
    }

    private SendOtpResponse issueRegistrationOtp(User user, RequestMetadata metadata, boolean resend) {
        String code = otpService.generateOtp();
        OtpVerification OtpVerification = new OtpVerification(
                user,
                OtpPurpose.EMAIL_REGISTRATION,
                passwordEncoder.encode(code),
                user.getEmail(),
                Instant.now().plusSeconds(otpExpirationSeconds)
        );
        OtpVerificationRepository.save(OtpVerification);
        try {
            emailDeliveryService.sendRegistrationOtp(user.getEmail(), user.getFullName(), code, (int) otpExpirationSeconds);
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to send OTP email", "OTP_SEND_FAILED");
        }
        return new SendOtpResponse(
                user.getEmail(),
                user.getPhone(),
                (int) otpExpirationSeconds,
                maskEmail(user.getEmail()),
                maskPhone(user.getPhone()),
                "OTP sent successfully",
                otpExposeForDev ? code : null
        );
    }

    @Transactional(noRollbackFor = ApiException.class)
    public LoginResponse verifyRegistrationOtp(String email, String phone, String otp, RequestMetadata metadata) {
        User user = resolveOtpUser(email, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);

        OtpVerification OtpVerification = OtpVerificationRepository.findFirstByUserAndPurposeAndVerifiedAtIsNullOrderByCreatedAtDesc(user, OtpPurpose.EMAIL_REGISTRATION)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP"));

        if (OtpVerification.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP has expired", "OTP_EXPIRED");
        }

        if (OtpVerification.getAttempts() >= otpMaxAttempts) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
        }

        if (!passwordEncoder.matches(otp, OtpVerification.getCodeHash())) {
            OtpVerification.incrementAttempts();
            if (OtpVerification.getAttempts() >= otpMaxAttempts) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
            }
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP");
        }

        OtpVerification.markVerified();
        user.activate();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user).getToken();

        return toLoginResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = resolveLoginUser(request.identifier())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials", "INVALID_CREDENTIALS"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account blocked", "ACCOUNT_BLOCKED");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Account suspended", "ACCOUNT_SUSPENDED");
        }

        if (user.getStatus() != UserStatus.ACTIVE || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials", "INVALID_CREDENTIALS");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user).getToken();

        return toLoginResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public RefreshTokenResponse refresh(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", "TOKEN_INVALID"));

        if (refreshToken.isRevoked()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", "TOKEN_INVALID");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired", "TOKEN_EXPIRED");
        }

        return new RefreshTokenResponse(
                jwtService.generateAccessToken(refreshToken.getUser()),
                jwtService.getAccessTokenExpirationSeconds()
        );
    }

    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", "TOKEN_INVALID"));
        refreshToken.revoke();
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusSeconds(refreshTokenExpirationSeconds)
        );
        return refreshTokenRepository.save(refreshToken);
    }

    private LoginResponse toLoginResponse(User user, String accessToken, String refreshToken) {
        return new LoginResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                "STANDARD",
                0,
                user.isNewCustomer(),
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationSeconds()
        );
    }

    private String maskPhone(String phone) {
        return phone.substring(0, 4) + "****" + phone.substring(phone.length() - 2);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(atIndex);
        }
        return email.charAt(0) + "***" + email.substring(atIndex - 1);
    }

    private void requirePendingUser(User user) {
        if (user.getStatus() != UserStatus.PENDING_VERIFY && user.getStatus() != UserStatus.PENDING) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Account is not pending OTP verification",
                    "RESOURCE_LOCKED"
            );
        }
    }

    private java.util.Optional<User> resolveOtpUser(String email, String phone) {
        if (email != null && !email.isBlank()) {
            return UserRepository.findByEmailIgnoreCase(email.trim());
        }
        if (phone != null && !phone.isBlank()) {
            return UserRepository.findByPhone(phone.trim());
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required", "VALIDATION_ERROR");
    }

    private void invalidateActiveRegistrationOtps(User user) {
        // Feature removed as invalidated_at column is removed
    }

    private void enforceResendLimit(User user) {
        Instant windowStart = Instant.now().minusSeconds(3600);
        if (OtpVerificationRepository.countByUserAndPurposeAndCreatedAtAfter(user, OtpPurpose.EMAIL_REGISTRATION, windowStart) >= 3) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP resend requests", "RATE_LIMIT_EXCEEDED");
        }
    }

    private java.util.Optional<User> resolveLoginUser(String identifier) {
        String normalizedIdentifier = identifier.trim();
        if (normalizedIdentifier.matches(PHONE_PATTERN)) {
            return UserRepository.findByPhone(normalizedIdentifier);
        }
        return UserRepository.findByEmailIgnoreCase(normalizedIdentifier);
    }

    public record RequestMetadata(String requestIp, String userAgent, String deviceFingerprint) {
    }
}

