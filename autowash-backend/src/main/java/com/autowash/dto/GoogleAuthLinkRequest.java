package com.autowash.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthLinkRequest(
        @NotBlank(message = "Ticket state is required")
        String state
) {
}
