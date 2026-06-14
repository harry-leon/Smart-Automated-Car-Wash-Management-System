package com.autowash.service;

import java.security.SecureRandom;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    public String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
