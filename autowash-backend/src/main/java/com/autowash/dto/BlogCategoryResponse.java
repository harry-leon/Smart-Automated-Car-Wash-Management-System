package com.autowash.dto;

public record BlogCategoryResponse(
        String id,
        String name,
        String slug,
        String description
) {
}
