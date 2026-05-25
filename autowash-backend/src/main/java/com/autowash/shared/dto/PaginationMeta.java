package com.autowash.shared.dto;

public record PaginationMeta(
        int page,
        int limit,
        long total,
        int totalPages,
        boolean hasMore
) {
}
