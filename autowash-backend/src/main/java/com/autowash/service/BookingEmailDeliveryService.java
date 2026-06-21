package com.autowash.service;

import com.autowash.entity.Booking;

public interface BookingEmailDeliveryService {

    void sendBookingOtp(Booking booking, String email, String otp, int expiresInSeconds);
}
