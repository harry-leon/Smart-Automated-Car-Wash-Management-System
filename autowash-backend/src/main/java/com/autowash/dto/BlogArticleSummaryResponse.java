package com.autowash.dto;

import java.time.Instant;
import lombok.Builder;

@Builder
public record BlogArticleSummaryResponse(
        String articleId,
        String title,
        String slug,
        String thumbnailUrl,
        String excerpt,
        String authorName,
        BlogCategoryResponse category,
        int viewCount,
        Instant publishedAt
) {
}
