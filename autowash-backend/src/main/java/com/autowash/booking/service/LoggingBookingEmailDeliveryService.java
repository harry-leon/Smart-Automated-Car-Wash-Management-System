package com.autowash.booking.service;

import com.autowash.booking.entity.CustomerBooking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "logging", matchIfMissing = true)
public class LoggingBookingEmailDeliveryService implements BookingEmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingBookingEmailDeliveryService.class);

    @Override
    public void sendBookingOtp(CustomerBooking booking, String email, String otp, int expiresInSeconds) {
        LOGGER.info(
                "Booking OTP email queued: bookingId={}, to={}, expiresInSeconds={}, template=booking-confirmation-otp",
                booking.getId(),
                email,
                expiresInSeconds
        );
    }
}
