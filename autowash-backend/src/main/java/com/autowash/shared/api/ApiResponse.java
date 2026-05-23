package com.autowash.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        int statusCode,
        String message,
        T data,
        String errorCode,
        List<ApiFieldError> errors,
        Instant timestamp
) {

    public static <T> ApiResponse<T> success(HttpStatus status, String message, T data) {
        return new ApiResponse<>(true, status.value(), message, data, null, null, Instant.now());
    }

    public static ApiResponse<Void> failure(HttpStatus status, String message, String errorCode) {
        return new ApiResponse<>(false, status.value(), message, null, errorCode, null, Instant.now());
    }

    public static ApiResponse<Void> validationFailure(List<ApiFieldError> errors) {
        return new ApiResponse<>(
                false,
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                null,
                "VALIDATION_ERROR",
                errors,
                Instant.now()
        );
    }
}
