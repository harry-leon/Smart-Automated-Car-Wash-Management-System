package com.autowash.shared.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final Map<String, Object> error;

    public ApiException(HttpStatus status, String message, String errorCode) {
        this(status, message, errorCode, null);
    }

    public ApiException(HttpStatus status, String message, String errorCode, Map<String, Object> error) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.error = error;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getError() {
        return error;
    }
}
