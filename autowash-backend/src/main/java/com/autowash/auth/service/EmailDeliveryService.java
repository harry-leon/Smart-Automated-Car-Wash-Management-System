package com.autowash.auth.service;

public interface EmailDeliveryService {

    void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds);
}
