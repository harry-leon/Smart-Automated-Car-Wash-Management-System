package com.autowash.booking.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingOtpExpiryScheduler {

    private final BookingOtpService bookingOtpService;

    public BookingOtpExpiryScheduler(BookingOtpService bookingOtpService) {
        this.bookingOtpService = bookingOtpService;
    }

    @Scheduled(fixedDelayString = "${autowash.booking.otp.expiry-scan-delay-ms:30000}")
    public void cancelExpiredBookings() {
        bookingOtpService.cancelExpiredPendingBookings();
    }
}
