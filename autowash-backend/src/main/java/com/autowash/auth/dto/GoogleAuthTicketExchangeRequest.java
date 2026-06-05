package com.autowash.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthTicketExchangeRequest(
        @NotBlank(message = "Ticket state is required")
        String state
) {
}
