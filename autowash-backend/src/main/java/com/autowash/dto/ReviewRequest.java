package com.autowash.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotBlank String bookingId,
        @Min(1) @Max(5) int rating,
        String comment,
        @Size(max = 500) String beforeImageUrl,
        @Size(max = 500) String afterImageUrl
) {
}
