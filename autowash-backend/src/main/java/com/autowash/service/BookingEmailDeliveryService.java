package com.autowash.service;

import com.autowash.entity.CustomerBooking;

public interface BookingEmailDeliveryService {

    void sendBookingOtp(CustomerBooking booking, String email, String otp, int expiresInSeconds);
}
