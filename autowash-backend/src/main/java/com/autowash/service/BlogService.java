package com.autowash.service;

import com.autowash.dto.BlogArticleRequest;
import com.autowash.dto.BlogArticleResponse;
import com.autowash.dto.BlogCategoryRequest;
import com.autowash.dto.BlogCategoryResponse;
import java.util.List;

public interface BlogService {
    List<BlogCategoryResponse> listCategories();
    BlogCategoryResponse createCategory(BlogCategoryRequest request);
    BlogCategoryResponse updateCategory(String categoryId, BlogCategoryRequest request);
    void deleteCategory(String categoryId);

    List<BlogArticleResponse> listPublishedArticles();
    BlogArticleResponse getPublishedArticle(String slug);
    List<BlogArticleResponse> listAdminArticles();
    BlogArticleResponse getAdminArticle(String articleId);
    BlogArticleResponse createArticle(BlogArticleRequest request);
    BlogArticleResponse updateArticle(String articleId, BlogArticleRequest request);
    void deleteArticle(String articleId);
}
