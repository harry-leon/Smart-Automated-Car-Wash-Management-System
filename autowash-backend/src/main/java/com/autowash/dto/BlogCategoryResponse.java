package com.autowash.dto;

import lombok.Builder;

@Builder
public record BlogCategoryResponse(
        String categoryId,
        String name,
        String slug,
        String description
) {
}
