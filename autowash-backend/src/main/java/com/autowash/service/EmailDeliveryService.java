package com.autowash.service;

public interface EmailDeliveryService {

    void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds);

    void sendPasswordResetOtp(String email, String fullName, String otp, int expiresInSeconds);
}
