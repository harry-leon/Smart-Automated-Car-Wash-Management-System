package com.autowash.service.impl;

import com.autowash.dto.BlogArticleDetailResponse;
import com.autowash.dto.BlogArticleSummaryResponse;
import com.autowash.dto.BlogCategoryResponse;
import com.autowash.entity.BlogArticle;
import com.autowash.entity.BlogCategory;
import com.autowash.entity.enums.BlogArticleStatus;
import com.autowash.repository.BlogArticleRepository;
import com.autowash.service.BlogService;
import com.autowash.shared.exception.ApiException;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogArticleRepository blogArticleRepository;

    public BlogServiceImpl(BlogArticleRepository blogArticleRepository) {
        this.blogArticleRepository = blogArticleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogArticleSummaryResponse> listPublishedArticles(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        return blogArticleRepository.findByStatusAndPublishedAtIsNotNullOrderByPublishedAtDesc(
                        BlogArticleStatus.PUBLISHED,
                        PageRequest.of(0, safeLimit)
                ).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BlogArticleDetailResponse getPublishedArticle(String slug) {
        BlogArticle article = blogArticleRepository.findBySlugAndStatusAndPublishedAtIsNotNull(
                        slug,
                        BlogArticleStatus.PUBLISHED
                )
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Article not found", "RESOURCE_NOT_FOUND"));
        return toDetailResponse(article);
    }

    private BlogArticleSummaryResponse toSummaryResponse(BlogArticle article) {
        return BlogArticleSummaryResponse.builder()
                .articleId(article.getId().toString())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnailUrl(article.getThumbnailUrl())
                .excerpt(article.getExcerpt())
                .authorName(article.getAuthor().getFullName())
                .category(toCategoryResponse(article.getCategory()))
                .viewCount(article.getViewCount())
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private BlogArticleDetailResponse toDetailResponse(BlogArticle article) {
        return BlogArticleDetailResponse.builder()
                .articleId(article.getId().toString())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnailUrl(article.getThumbnailUrl())
                .excerpt(article.getExcerpt())
                .content(article.getContent())
                .authorName(article.getAuthor().getFullName())
                .category(toCategoryResponse(article.getCategory()))
                .viewCount(article.getViewCount())
                .publishedAt(article.getPublishedAt())
                .build();
    }

    private BlogCategoryResponse toCategoryResponse(BlogCategory category) {
        return BlogCategoryResponse.builder()
                .categoryId(category.getId().toString())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .build();
    }
}
