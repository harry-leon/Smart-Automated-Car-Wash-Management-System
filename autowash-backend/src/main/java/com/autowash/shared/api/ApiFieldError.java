package com.autowash.shared.api;

public record ApiFieldError(
        String field,
        String message,
        String code
) {
}
