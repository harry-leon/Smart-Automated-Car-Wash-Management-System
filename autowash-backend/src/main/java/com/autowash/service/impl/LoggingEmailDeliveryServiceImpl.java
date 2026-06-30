package com.autowash.service.impl;

import com.autowash.service.EmailDeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "logging", matchIfMissing = true)
public class LoggingEmailDeliveryServiceImpl implements EmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingEmailDeliveryServiceImpl.class);

    @Override
    public void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds) {
        LOGGER.info(
                "Registration OTP email queued: to={}, name={}, expiresInSeconds={}, template=registration-email-otp",
                email,
                fullName,
                expiresInSeconds
        );
    }

    @Override
    public void sendPasswordResetOtp(String email, String fullName, String otp, int expiresInSeconds) {
        LOGGER.info(
                "Password reset OTP email queued: to={}, name={}, expiresInSeconds={}, template=password-reset-otp",
                email,
                fullName,
                expiresInSeconds
        );
    }
}
