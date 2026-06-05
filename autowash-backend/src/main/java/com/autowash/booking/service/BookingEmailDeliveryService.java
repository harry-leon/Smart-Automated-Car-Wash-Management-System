package com.autowash.booking.service;

import com.autowash.booking.entity.CustomerBooking;

public interface BookingEmailDeliveryService {

    void sendBookingOtp(CustomerBooking booking, String email, String otp, int expiresInSeconds);
}
