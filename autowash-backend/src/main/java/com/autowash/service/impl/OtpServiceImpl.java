package com.autowash.service.impl;

import com.autowash.service.OtpService;
import java.security.SecureRandom;
import org.springframework.stereotype.Service;

@Service
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
