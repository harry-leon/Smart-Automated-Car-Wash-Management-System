package com.autowash.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateReviewFeaturedRequest(
        @NotNull Boolean featured
) {
}
