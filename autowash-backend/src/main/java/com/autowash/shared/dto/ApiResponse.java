package com.autowash.shared.dto;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        int statusCode,
        String message,
        T data,
        PaginationMeta pagination,
        Instant timestamp
) {

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, 200, message, data, null, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data, PaginationMeta pagination) {
        return new ApiResponse<>(true, 200, message, data, pagination, Instant.now());
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(true, 201, message, data, null, Instant.now());
    }
}
