package com.autowash.operation.service;

import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.shared.exception.ApiException;
import org.springframework.http.HttpStatus;

public final class WashSessionLifecycle {

    private WashSessionLifecycle() {
    }

    public static void validateTransition(WashSessionStatus current, WashSessionStatus next) {
        if (!isValidTransition(current, next)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Invalid transition: " + current + " \u2192 " + next,
                    "INVALID_STATE_TRANSITION"
            );
        }
    }

    public static boolean isValidTransition(WashSessionStatus current, WashSessionStatus next) {
        return switch (current) {
            case PENDING -> next == WashSessionStatus.QUEUED;
            case QUEUED -> next == WashSessionStatus.CHECKED_IN;
            case CHECKED_IN -> next == WashSessionStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == WashSessionStatus.COMPLETED;
            case COMPLETED -> false;
        };
    }
}
