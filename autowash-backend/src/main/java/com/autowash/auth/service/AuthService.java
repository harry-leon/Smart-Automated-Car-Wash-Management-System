package com.autowash.auth.service;

import com.autowash.auth.dto.LoginRequest;
import com.autowash.auth.dto.LoginResponse;
import com.autowash.auth.dto.RefreshTokenResponse;
import com.autowash.auth.dto.RegisterRequest;
import com.autowash.auth.dto.RegisterResponse;
import com.autowash.auth.dto.SendOtpResponse;
import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.OtpPurpose;
import com.autowash.auth.entity.OtpRecord;
import com.autowash.auth.entity.RefreshToken;
import com.autowash.auth.entity.UserStatus;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.auth.repository.OtpRecordRepository;
import com.autowash.auth.repository.RefreshTokenRepository;
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

    private final AuthUserRepository authUserRepository;
    private final OtpRecordRepository otpRecordRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final long otpExpirationSeconds;
    private final int otpMaxAttempts;
    private final long refreshTokenExpirationSeconds;
    private final boolean otpExposeForDev;

    public AuthService(
            AuthUserRepository authUserRepository,
            OtpRecordRepository otpRecordRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            JwtService jwtService,
            @Value("${autowash.auth.otp.expiration-seconds}") long otpExpirationSeconds,
            @Value("${autowash.auth.otp.max-attempts}") int otpMaxAttempts,
            @Value("${autowash.auth.jwt.refresh-token-expiration-seconds}") long refreshTokenExpirationSeconds,
            @Value("${autowash.auth.otp.expose-for-dev}") boolean otpExposeForDev
    ) {
        this.authUserRepository = authUserRepository;
        this.otpRecordRepository = otpRecordRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.otpExpirationSeconds = otpExpirationSeconds;
        this.otpMaxAttempts = otpMaxAttempts;
        this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
        this.otpExposeForDev = otpExposeForDev;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (authUserRepository.existsByPhone(request.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already registered", "DUPLICATE_PHONE");
        }

        AuthUser user = new AuthUser(
                request.fullName(),
                request.phone(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        authUserRepository.save(user);

        return new RegisterResponse(
                user.getId().toString(),
                user.getPhone(),
                user.getFullName(),
                user.getEmail(),
                user.getStatus().name(),
                true,
                (int) otpExpirationSeconds
        );
    }

    @Transactional
    public SendOtpResponse sendRegistrationOtp(String phone) {
        AuthUser user = authUserRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);

        String code = otpService.generateOtp();
        OtpRecord otpRecord = new OtpRecord(user, OtpPurpose.REGISTRATION, code, Instant.now().plusSeconds(otpExpirationSeconds));
        otpRecordRepository.save(otpRecord);

        return new SendOtpResponse(
                user.getPhone(),
                (int) otpExpirationSeconds,
                maskPhone(user.getPhone()),
                "OTP sent successfully",
                otpExposeForDev ? otpRecord.getCode() : null
        );
    }

    @Transactional
    public LoginResponse verifyRegistrationOtp(String phone, String otp) {
        AuthUser user = authUserRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);

        OtpRecord otpRecord = otpRecordRepository.findFirstByUserAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(user, OtpPurpose.REGISTRATION)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP"));

        if (otpRecord.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP has expired", "OTP_EXPIRED");
        }

        if (otpRecord.getAttempts() >= otpMaxAttempts) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
        }

        if (!otpRecord.getCode().equals(otp)) {
            otpRecord.incrementAttempts();
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP");
        }

        otpRecord.markVerified();
        user.activate();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user).getToken();

        return toLoginResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        AuthUser user = resolveLoginUser(request.identifier())
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
    public RefreshToken createRefreshToken(AuthUser user) {
        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusSeconds(refreshTokenExpirationSeconds)
        );
        return refreshTokenRepository.save(refreshToken);
    }

    private LoginResponse toLoginResponse(AuthUser user, String accessToken, String refreshToken) {
        return new LoginResponse(
                user.getId().toString(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getTier().name(),
                0,
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationSeconds()
        );
    }

    private String maskPhone(String phone) {
        return phone.substring(0, 4) + "****" + phone.substring(phone.length() - 2);
    }

    private void requirePendingUser(AuthUser user) {
        if (user.getStatus() != UserStatus.PENDING) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Account is not pending OTP verification",
                    "RESOURCE_LOCKED"
            );
        }
    }

    private java.util.Optional<AuthUser> resolveLoginUser(String identifier) {
        String normalizedIdentifier = identifier.trim();
        if (normalizedIdentifier.matches(PHONE_PATTERN)) {
            return authUserRepository.findByPhone(normalizedIdentifier);
        }
        return authUserRepository.findByEmailIgnoreCase(normalizedIdentifier);
    }
}
