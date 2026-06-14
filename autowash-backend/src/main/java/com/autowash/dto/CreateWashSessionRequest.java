package com.autowash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWashSessionRequest(
        @NotBlank String bookingId,
        @Size(max = 500) String notes
) {
}
