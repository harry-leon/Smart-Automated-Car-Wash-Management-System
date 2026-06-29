package com.autowash.service;

import com.autowash.dto.AdminBlogArticleRequest;
import com.autowash.dto.AdminBlogArticleResponse;
import com.autowash.dto.AdminBlogCategoryRequest;
import com.autowash.dto.BlogCategoryResponse;
import java.util.List;

public interface AdminBlogService {
    List<BlogCategoryResponse> listCategories();
    BlogCategoryResponse createCategory(AdminBlogCategoryRequest request);
    BlogCategoryResponse updateCategory(String categoryId, AdminBlogCategoryRequest request);
    BlogCategoryResponse deleteCategory(String categoryId);

    List<AdminBlogArticleResponse> listArticles();
    AdminBlogArticleResponse createArticle(AdminBlogArticleRequest request);
    AdminBlogArticleResponse updateArticle(String articleId, AdminBlogArticleRequest request);
    AdminBlogArticleResponse deleteArticle(String articleId);
}
