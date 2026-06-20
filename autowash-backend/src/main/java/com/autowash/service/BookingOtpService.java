package com.autowash.service;

import com.autowash.entity.*;
import com.autowash.service.OtpService;
import com.autowash.dto.BookingOtpResponse;
import com.autowash.entity.enums.BookingOtpAuditEvent;


import com.autowash.entity.enums.BookingOtpChallengeStatus;
import com.autowash.entity.enums.BookingStatus;

import com.autowash.repository.BookingOtpAuditLogRepository;
import com.autowash.repository.BookingOtpChallengeRepository;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingOtpService {

    private final BookingOtpChallengeRepository challengeRepository;
    private final BookingOtpAuditLogRepository auditLogRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final BookingEmailDeliveryService emailDeliveryService;
    private final long ttlSeconds;
    private final int maxAttempts;
    private final int resendLimit;
    private final int sendRetryAttempts;
    private final boolean exposeForDev;

    public BookingOtpService(
            BookingOtpChallengeRepository challengeRepository,
            BookingOtpAuditLogRepository auditLogRepository,
            OtpService otpService,
            PasswordEncoder passwordEncoder,
            BookingEmailDeliveryService emailDeliveryService,
            @Value("${autowash.booking.otp.expiration-seconds:300}") long ttlSeconds,
            @Value("${autowash.booking.otp.max-attempts:3}") int maxAttempts,
            @Value("${autowash.booking.otp.resend-limit-per-hour:3}") int resendLimit,
            @Value("${autowash.booking.otp.send-retry-attempts:3}") int sendRetryAttempts,
            @Value("${autowash.booking.otp.expose-for-dev:true}") boolean exposeForDev
    ) {
        this.challengeRepository = challengeRepository;
        this.auditLogRepository = auditLogRepository;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.emailDeliveryService = emailDeliveryService;
        this.ttlSeconds = ttlSeconds;
        this.maxAttempts = maxAttempts;
        this.resendLimit = resendLimit;
        this.sendRetryAttempts = sendRetryAttempts;
        this.exposeForDev = exposeForDev;
    }

    @Transactional
    public BookingOtpResponse issueInitialOtp(CustomerBooking booking, RequestMetadata metadata) {
        return issueOtp(booking, metadata, false, false);
    }

    @Transactional
    public BookingOtpResponse resendOtp(CustomerBooking booking, RequestMetadata metadata) {
        requirePendingBooking(booking);
        long resendCount = auditLogRepository.countByBookingAndEventTypeInAndCreatedAtAfter(
                booking,
                List.of(BookingOtpAuditEvent.RESEND),
                Instant.now().minusSeconds(3600)
        );
        if (resendCount >= resendLimit) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many booking OTP resend requests", "RATE_LIMIT_EXCEEDED");
        }
        return issueOtp(booking, metadata, true, true);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public BookingOtpResponse verifyOtp(CustomerBooking booking, String otp, RequestMetadata metadata) {
        requirePendingBooking(booking);
        BookingOtpChallenge challenge = challengeRepository.findFirstByBookingAndStatusOrderBySentAtDesc(
                        booking,
                        BookingOtpChallengeStatus.PENDING
                )
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP"));

        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            challenge.expire();
            booking.expireOtpConfirmation();
            audit(booking, BookingOtpAuditEvent.EXPIRED, challenge.getAttempts(), metadata, "Booking OTP expired");
            audit(booking, BookingOtpAuditEvent.CANCELLED, challenge.getAttempts(), metadata, "Booking cancelled after OTP expiry");
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP has expired and booking was cancelled", "OTP_EXPIRED");
        }

        if (challenge.isLocked() || challenge.getAttempts() >= maxAttempts) {
            challenge.lock();
            audit(booking, BookingOtpAuditEvent.VERIFY_FAILED, challenge.getAttempts(), metadata, "Booking OTP locked");
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
        }

        if (!passwordEncoder.matches(otp, challenge.getCodeHash())) {
            challenge.incrementAttempts();
            audit(booking, BookingOtpAuditEvent.VERIFY_FAILED, challenge.getAttempts(), metadata, "Booking OTP verification failed");
            if (challenge.getAttempts() >= maxAttempts) {
                challenge.lock();
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Too many failed attempts", "RATE_LIMIT_EXCEEDED");
            }
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "OTP incorrect or expired", "INVALID_OTP");
        }

        challenge.verify();
        booking.confirmByOtp();
        audit(booking, BookingOtpAuditEvent.VERIFY_SUCCESS, challenge.getAttempts(), metadata, "Booking OTP verified");
        return response(booking, challenge, "Booking verified successfully", null);
    }

    @Transactional
    public void cancelExpiredPendingBookings() {
        List<BookingOtpChallenge> expired = challengeRepository.findByStatusAndExpiresAtBefore(
                BookingOtpChallengeStatus.PENDING,
                Instant.now()
        );
        for (BookingOtpChallenge challenge : expired) {
            CustomerBooking booking = challenge.getBooking();
            if (booking.getStatus() == BookingStatus.PENDING) {
                challenge.expire();
                booking.expireOtpConfirmation();
                audit(booking, BookingOtpAuditEvent.EXPIRED, challenge.getAttempts(), RequestMetadata.system(), "Booking OTP expired");
                audit(booking, BookingOtpAuditEvent.CANCELLED, challenge.getAttempts(), RequestMetadata.system(), "Booking auto-cancelled after OTP expiry");
            }
        }
    }

    private BookingOtpResponse issueOtp(CustomerBooking booking, RequestMetadata metadata, boolean resend, boolean failOnDeliveryFailure) {
        requireCustomerEmail(booking);
        Instant expiresAt = Instant.now().plusSeconds(ttlSeconds);
        challengeRepository.findByBookingAndStatus(booking, BookingOtpChallengeStatus.PENDING)
                .forEach(BookingOtpChallenge::invalidate);

        String otp = otpService.generateOtp();
        BookingOtpChallenge challenge = challengeRepository.save(new BookingOtpChallenge(
                booking,
                passwordEncoder.encode(otp),
                booking.getCustomer().getEmail(),
                expiresAt,
                exposeForDev ? otp : null
        ));
        booking.startOtpConfirmationWindow(expiresAt);

        if (resend) {
            audit(booking, BookingOtpAuditEvent.RESEND, 0, metadata, "Booking OTP resent");
        }

        for (int attempt = 1; attempt <= Math.max(sendRetryAttempts, 1); attempt++) {
            try {
                emailDeliveryService.sendBookingOtp(booking, booking.getCustomer().getEmail(), otp, (int) ttlSeconds);
                audit(booking, BookingOtpAuditEvent.SEND_SUCCESS, 0, metadata, "Booking OTP email sent");
                return response(booking, challenge, "OTP sent successfully", exposeForDev ? otp : null);
            } catch (RuntimeException exception) {
                audit(booking, BookingOtpAuditEvent.SEND_FAILED, 0, metadata, "Booking OTP email send failed: " + exception.getMessage());
            }
        }

        if (failOnDeliveryFailure) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to send booking OTP email", "OTP_SEND_FAILED");
        }
        audit(booking, BookingOtpAuditEvent.CANCELLED, 0, metadata, "Booking remains pending after OTP email failure");
        return response(booking, challenge, "OTP email delivery failed after retry", exposeForDev ? otp : null);
    }

    private void requirePendingBooking(CustomerBooking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Booking is not pending OTP confirmation", "RESOURCE_LOCKED");
        }
    }

    private void requireCustomerEmail(CustomerBooking booking) {
        String email = booking.getCustomer().getEmail();
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Customer email is required for booking OTP", "EMAIL_REQUIRED");
        }
    }

    private BookingOtpResponse response(CustomerBooking booking, BookingOtpChallenge challenge, String message, String devOtp) {
        return new BookingOtpResponse(
                booking.getId(),
                booking.getStatus().name(),
                booking.getConfirmationStatus().name(),
                (int) ttlSeconds,
                challenge.getExpiresAt(),
                message,
                devOtp
        );
    }

    private void audit(CustomerBooking booking, BookingOtpAuditEvent event, int attemptCount, RequestMetadata metadata, String message) {
        auditLogRepository.save(new BookingOtpAuditLog(
                booking,
                event,
                attemptCount,
                booking.getCustomer().getEmail(),
                metadata.requestIp(),
                truncate(metadata.userAgent(), 500),
                truncate(message, 500)
        ));
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    public record RequestMetadata(String requestIp, String userAgent) {
        static RequestMetadata system() {
            return new RequestMetadata("system", "scheduled-job");
        }
    }
}
