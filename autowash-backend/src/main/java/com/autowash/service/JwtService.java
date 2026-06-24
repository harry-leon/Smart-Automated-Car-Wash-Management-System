package com.autowash.service;

import com.autowash.entity.User;

public interface JwtService {
    String generateAccessToken(User user);
    String extractSubject(String token);
    boolean isValid(String token);
    long getAccessTokenExpirationSeconds();
}
