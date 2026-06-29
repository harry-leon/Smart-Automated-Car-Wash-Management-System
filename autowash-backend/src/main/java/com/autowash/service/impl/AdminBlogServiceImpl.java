package com.autowash.service.impl;

import com.autowash.dto.AdminBlogArticleRequest;
import com.autowash.dto.AdminBlogArticleResponse;
import com.autowash.dto.AdminBlogCategoryRequest;
import com.autowash.dto.BlogCategoryResponse;
import com.autowash.entity.BlogArticle;
import com.autowash.entity.BlogCategory;
import com.autowash.entity.User;
import com.autowash.repository.BlogArticleRepository;
import com.autowash.repository.BlogCategoryRepository;
import com.autowash.service.AdminBlogService;
import com.autowash.service.CurrentUserService;
import com.autowash.shared.exception.ApiException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBlogServiceImpl implements AdminBlogService {

    private final BlogCategoryRepository blogCategoryRepository;
    private final BlogArticleRepository blogArticleRepository;
    private final CurrentUserService currentUserService;

    public AdminBlogServiceImpl(
            BlogCategoryRepository blogCategoryRepository,
            BlogArticleRepository blogArticleRepository,
            CurrentUserService currentUserService
    ) {
        this.blogCategoryRepository = blogCategoryRepository;
        this.blogArticleRepository = blogArticleRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogCategoryResponse> listCategories() {
        return blogCategoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public BlogCategoryResponse createCategory(AdminBlogCategoryRequest request) {
        if (blogCategoryRepository.existsBySlug(request.slug())) {
            throw conflict("Category slug already exists");
        }
        BlogCategory category = blogCategoryRepository.save(new BlogCategory(
                request.name(),
                request.slug(),
                request.description()
        ));
        return toCategoryResponse(category);
    }

    @Override
    @Transactional
    public BlogCategoryResponse updateCategory(String categoryId, AdminBlogCategoryRequest request) {
        BlogCategory category = requireCategory(categoryId);
        if (blogCategoryRepository.existsBySlugAndIdNot(request.slug(), category.getId())) {
            throw conflict("Category slug already exists");
        }
        category.update(request.name(), request.slug(), request.description());
        return toCategoryResponse(category);
    }

    @Override
    @Transactional
    public BlogCategoryResponse deleteCategory(String categoryId) {
        BlogCategory category = requireCategory(categoryId);
        BlogCategoryResponse response = toCategoryResponse(category);
        blogCategoryRepository.delete(category);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminBlogArticleResponse> listArticles() {
        return blogArticleRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toArticleResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminBlogArticleResponse createArticle(AdminBlogArticleRequest request) {
        if (blogArticleRepository.existsBySlug(request.slug())) {
            throw conflict("Article slug already exists");
        }
        BlogCategory category = requireCategory(request.categoryId());
        User author = currentUserService.getCurrentUser();
        BlogArticle article = blogArticleRepository.save(new BlogArticle(
                category,
                author,
                request.title(),
                request.slug(),
                request.thumbnailUrl(),
                request.excerpt(),
                request.content(),
                request.status()
        ));
        return toArticleResponse(article);
    }

    @Override
    @Transactional
    public AdminBlogArticleResponse updateArticle(String articleId, AdminBlogArticleRequest request) {
        BlogArticle article = requireArticle(articleId);
        if (blogArticleRepository.existsBySlugAndIdNot(request.slug(), article.getId())) {
            throw conflict("Article slug already exists");
        }
        BlogCategory category = requireCategory(request.categoryId());
        article.update(
                category,
                request.title(),
                request.slug(),
                request.thumbnailUrl(),
                request.excerpt(),
                request.content(),
                request.status()
        );
        return toArticleResponse(article);
    }

    @Override
    @Transactional
    public AdminBlogArticleResponse deleteArticle(String articleId) {
        BlogArticle article = requireArticle(articleId);
        AdminBlogArticleResponse response = toArticleResponse(article);
        blogArticleRepository.delete(article);
        return response;
    }

    private BlogCategory requireCategory(String categoryId) {
        return blogCategoryRepository.findById(parseUuid(categoryId, "Category not found"))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found", "RESOURCE_NOT_FOUND"));
    }

    private BlogArticle requireArticle(String articleId) {
        return blogArticleRepository.findById(parseUuid(articleId, "Article not found"))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Article not found", "RESOURCE_NOT_FOUND"));
    }

    private UUID parseUuid(String id, String message) {
        try {
            return UUID.fromString(id);
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, message, "RESOURCE_NOT_FOUND");
        }
    }

    private ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message, "RESOURCE_CONFLICT");
    }

    private BlogCategoryResponse toCategoryResponse(BlogCategory category) {
        return BlogCategoryResponse.builder()
                .categoryId(category.getId().toString())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .build();
    }

    private AdminBlogArticleResponse toArticleResponse(BlogArticle article) {
        return AdminBlogArticleResponse.builder()
                .articleId(article.getId().toString())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnailUrl(article.getThumbnailUrl())
                .excerpt(article.getExcerpt())
                .content(article.getContent())
                .authorName(article.getAuthor().getFullName())
                .category(toCategoryResponse(article.getCategory()))
                .status(article.getStatus().name())
                .viewCount(article.getViewCount())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
