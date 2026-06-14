package com.autowash.service;

import com.autowash.dto.LoginRequest;
import com.autowash.dto.LoginResponse;
import com.autowash.dto.RefreshTokenResponse;
import com.autowash.dto.RegisterRequest;
import com.autowash.dto.RegisterResponse;
import com.autowash.dto.SendOtpResponse;
import com.autowash.entity.AuthUser;
import com.autowash.entity.OtpAuditEvent;
import com.autowash.entity.OtpPurpose;
import com.autowash.entity.OtpRecord;
import com.autowash.entity.RefreshToken;
import com.autowash.entity.UserStatus;
import com.autowash.repository.AuthUserRepository;
import com.autowash.repository.OtpAuditLogRepository;
import com.autowash.repository.OtpRecordRepository;
import com.autowash.repository.RefreshTokenRepository;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.List;
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
    private final OtpAuditLogRepository otpAuditLogRepository;
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
            AuthUserRepository authUserRepository,
            OtpRecordRepository otpRecordRepository,
            OtpAuditLogRepository otpAuditLogRepository,
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
        this.authUserRepository = authUserRepository;
        this.otpRecordRepository = otpRecordRepository;
        this.otpAuditLogRepository = otpAuditLogRepository;
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
        if (authUserRepository.existsByPhone(request.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already registered", "DUPLICATE_PHONE");
        }
        if (authUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered", "DUPLICATE_EMAIL");
        }

        AuthUser user = new AuthUser(
                request.fullName(),
                request.phone(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        authUserRepository.save(user);
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
        AuthUser user = resolveOtpUser(email, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);
        enforceResendLimit(user, metadata);

        return issueRegistrationOtp(user, metadata, true);
    }

    private SendOtpResponse issueRegistrationOtp(AuthUser user, RequestMetadata metadata, boolean resend) {
        invalidateActiveRegistrationOtps(user);
        String code = otpService.generateOtp();
        OtpRecord otpRecord = new OtpRecord(
                user,
                OtpPurpose.EMAIL_REGISTRATION,
                passwordEncoder.encode(code),
                user.getEmail(),
                Instant.now().plusSeconds(otpExpirationSeconds)
        );
        otpRecordRepository.save(otpRecord);
        audit(user, resend ? OtpAuditEvent.RESEND : OtpAuditEvent.GENERATE, 0, metadata, "Registration OTP generated");
        try {
            emailDeliveryService.sendRegistrationOtp(user.getEmail(), user.getFullName(), code, (int) otpExpirationSeconds);
            audit(user, OtpAuditEvent.SEND_SUCCESS, 0, metadata, "Registration OTP email sent");
        } catch (RuntimeException exception) {
            audit(user, OtpAuditEvent.SEND_FAILED, 0, metadata, exception.getMessage());
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
        AuthUser user = resolveOtpUser(email, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        requirePendingUser(user);

        OtpRecord otpRecord = otpRecordRepository.findFirstByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNullOrderByCreatedAtDesc(user, OtpPurpose.EMAIL_REGISTRATION)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP"));

        if (otpRecord.getExpiresAt().isBefore(Instant.now())) {
            otpRecord.invalidate();
            audit(user, OtpAuditEvent.EXPIRED, otpRecord.getAttempts(), metadata, "Registration OTP expired");
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP has expired", "OTP_EXPIRED");
        }

        if (otpRecord.isLocked() || otpRecord.getAttempts() >= otpMaxAttempts) {
            otpRecord.lock();
            audit(user, OtpAuditEvent.LOCKED, otpRecord.getAttempts(), metadata, "Registration OTP locked");
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
        }

        if (!passwordEncoder.matches(otp, otpRecord.getCode())) {
            otpRecord.incrementAttempts();
            if (otpRecord.getAttempts() >= otpMaxAttempts) {
                otpRecord.lock();
                audit(user, OtpAuditEvent.LOCKED, otpRecord.getAttempts(), metadata, "Registration OTP locked");
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
            }
            audit(user, OtpAuditEvent.VERIFY_FAIL, otpRecord.getAttempts(), metadata, "Registration OTP verification failed");
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP");
        }

        otpRecord.markVerified();
        user.activate();
        audit(user, OtpAuditEvent.VERIFY_SUCCESS, otpRecord.getAttempts(), metadata, "Registration OTP verified");

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

    private void requirePendingUser(AuthUser user) {
        if (user.getStatus() != UserStatus.PENDING_VERIFY && user.getStatus() != UserStatus.PENDING) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Account is not pending OTP verification",
                    "RESOURCE_LOCKED"
            );
        }
    }

    private java.util.Optional<AuthUser> resolveOtpUser(String email, String phone) {
        if (email != null && !email.isBlank()) {
            return authUserRepository.findByEmailIgnoreCase(email.trim());
        }
        if (phone != null && !phone.isBlank()) {
            return authUserRepository.findByPhone(phone.trim());
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required", "VALIDATION_ERROR");
    }

    private void invalidateActiveRegistrationOtps(AuthUser user) {
        otpRecordRepository.findByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNull(user, OtpPurpose.EMAIL_REGISTRATION)
                .forEach(OtpRecord::invalidate);
    }

    private void enforceResendLimit(AuthUser user, RequestMetadata metadata) {
        Instant windowStart = Instant.now().minusSeconds(3600);
        List<OtpAuditEvent> resendEvents = List.of(OtpAuditEvent.RESEND);
        if (otpAuditLogRepository.countByPurposeAndEventTypeInAndDeliveryAddressIgnoreCaseAndCreatedAtAfter(
                OtpPurpose.EMAIL_REGISTRATION,
                resendEvents,
                user.getEmail(),
                windowStart
        ) >= 3) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP resend requests", "RATE_LIMIT_EXCEEDED");
        }
        if (metadata.requestIp() != null && otpAuditLogRepository.countByPurposeAndEventTypeInAndRequestIpAndCreatedAtAfter(
                OtpPurpose.EMAIL_REGISTRATION,
                resendEvents,
                metadata.requestIp(),
                windowStart
        ) >= 30) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP resend requests", "RATE_LIMIT_EXCEEDED");
        }
        if (metadata.deviceFingerprint() != null && otpAuditLogRepository.countByPurposeAndEventTypeInAndDeviceFingerprintAndCreatedAtAfter(
                OtpPurpose.EMAIL_REGISTRATION,
                resendEvents,
                metadata.deviceFingerprint(),
                windowStart
        ) >= 3) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP resend requests", "RATE_LIMIT_EXCEEDED");
        }
    }

    private void audit(AuthUser user, OtpAuditEvent event, int attemptCount, RequestMetadata metadata, String message) {
        otpAuditLogRepository.save(new com.autowash.entity.OtpAuditLog(
                user,
                OtpPurpose.EMAIL_REGISTRATION,
                event,
                user.getEmail(),
                attemptCount,
                metadata.requestIp(),
                truncate(metadata.userAgent(), 500),
                truncate(metadata.deviceFingerprint(), 255),
                truncate(message, 500)
        ));
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private java.util.Optional<AuthUser> resolveLoginUser(String identifier) {
        String normalizedIdentifier = identifier.trim();
        if (normalizedIdentifier.matches(PHONE_PATTERN)) {
            return authUserRepository.findByPhone(normalizedIdentifier);
        }
        return authUserRepository.findByEmailIgnoreCase(normalizedIdentifier);
    }

    public record RequestMetadata(String requestIp, String userAgent, String deviceFingerprint) {
    }
}
