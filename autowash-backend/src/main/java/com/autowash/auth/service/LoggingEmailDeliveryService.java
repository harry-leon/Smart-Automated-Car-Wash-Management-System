package com.autowash.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "logging", matchIfMissing = true)
public class LoggingEmailDeliveryService implements EmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingEmailDeliveryService.class);

    @Override
    public void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds) {
        LOGGER.info(
                "Registration OTP email queued: to={}, name={}, expiresInSeconds={}, template=registration-email-otp",
                email,
                fullName,
                expiresInSeconds
        );
    }
}
