package com.autowash.shared.exception;

import com.autowash.shared.api.ApiFieldError;
import com.autowash.shared.api.ApiResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception) {
        HttpStatus status = exception.getStatus();
        return ResponseEntity
                .status(status)
                .body(ApiResponse.failure(status, exception.getMessage(), exception.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        List<ApiFieldError> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toApiFieldError)
                .toList();

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.validationFailure(errors));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(NoResourceFoundException exception) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure(
                        HttpStatus.NOT_FOUND,
                        "Resource not found",
                        "RESOURCE_NOT_FOUND"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Unexpected server error",
                        "INTERNAL_SERVER_ERROR"
                ));
    }

    private ApiFieldError toApiFieldError(FieldError error) {
        return new ApiFieldError(error.getField(), error.getDefaultMessage(), error.getCode());
    }
}
