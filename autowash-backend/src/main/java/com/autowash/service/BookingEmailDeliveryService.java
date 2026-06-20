package com.autowash.service;
import com.autowash.entity.*;



public interface BookingEmailDeliveryService {

    void sendBookingOtp(CustomerBooking booking, String email, String otp, int expiresInSeconds);
}
