package com.autowash.shared.dto;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        int statusCode,
        String message,
        T data,
        Instant timestamp
) {

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, 200, message, data, Instant.now());
    }
}
