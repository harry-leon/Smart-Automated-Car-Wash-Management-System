package com.autowash.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BookingOtpResponse(
        String bookingId,
        String status,
        String confirmationStatus,
        int otpExpiresIn,
        Instant expiresAt,
        String message,
        String devOtp
) {
}
