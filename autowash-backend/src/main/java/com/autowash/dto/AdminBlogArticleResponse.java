package com.autowash.dto;

import java.time.Instant;
import lombok.Builder;

@Builder
public record AdminBlogArticleResponse(
        String articleId,
        String title,
        String slug,
        String thumbnailUrl,
        String excerpt,
        String content,
        String authorName,
        BlogCategoryResponse category,
        String status,
        int viewCount,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
