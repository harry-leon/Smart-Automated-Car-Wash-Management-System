package com.autowash.dto;

import jakarta.validation.constraints.Size;

public record PayBookingRequest(
        @Size(max = 120, message = "Transaction reference must not exceed 120 characters")
        String transactionRef
) {
}
