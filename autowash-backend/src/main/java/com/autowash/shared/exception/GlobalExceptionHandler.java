package com.autowash.shared.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        List<Map<String, String>> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();

        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "statusCode", 400,
                "message", "Validation failed",
                "errorCode", "VALIDATION_ERROR",
                "errors", errors,
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException exception) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("statusCode", exception.getStatus().value());
        body.put("message", exception.getMessage());
        body.put("errorCode", exception.getErrorCode());
        if (exception.getError() != null) {
            body.put("error", exception.getError());
        }
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(exception.getStatus()).body(body);
    }

    private Map<String, String> toFieldError(FieldError error) {
        return Map.of(
                "field", error.getField(),
                "message", error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(),
                "code", "INVALID_FORMAT"
        );
    }
}
