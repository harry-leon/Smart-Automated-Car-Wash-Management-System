package com.autowash.dto;

import java.time.Instant;
import lombok.Builder;

@Builder
public record BlogArticleDetailResponse(
        String articleId,
        String title,
        String slug,
        String thumbnailUrl,
        String excerpt,
        String content,
        String authorName,
        BlogCategoryResponse category,
        int viewCount,
        Instant publishedAt
) {
}
