package com.autowash.controller;

import com.autowash.dto.AdminBlogArticleRequest;
import com.autowash.dto.AdminBlogArticleResponse;
import com.autowash.dto.AdminBlogCategoryRequest;
import com.autowash.dto.BlogCategoryResponse;
import com.autowash.service.AdminBlogService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/blog")
@Tag(name = "Admin Blog")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBlogController {

    private final AdminBlogService adminBlogService;

    public AdminBlogController(AdminBlogService adminBlogService) {
        this.adminBlogService = adminBlogService;
    }

    @GetMapping("/categories")
    @Operation(summary = "List blog categories")
    public ApiResponse<List<BlogCategoryResponse>> listCategories() {
        return ApiResponse.ok("Blog categories retrieved", adminBlogService.listCategories());
    }

    @PostMapping("/categories")
    @Operation(summary = "Create blog category")
    public ResponseEntity<ApiResponse<BlogCategoryResponse>> createCategory(
            @Valid @RequestBody AdminBlogCategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Blog category created", adminBlogService.createCategory(request)));
    }

    @PutMapping("/categories/{categoryId}")
    @Operation(summary = "Update blog category")
    public ApiResponse<BlogCategoryResponse> updateCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody AdminBlogCategoryRequest request
    ) {
        return ApiResponse.ok("Blog category updated", adminBlogService.updateCategory(categoryId, request));
    }

    @DeleteMapping("/categories/{categoryId}")
    @Operation(summary = "Delete blog category")
    public ApiResponse<BlogCategoryResponse> deleteCategory(@PathVariable String categoryId) {
        return ApiResponse.ok("Blog category deleted", adminBlogService.deleteCategory(categoryId));
    }

    @GetMapping("/articles")
    @Operation(summary = "List blog articles for admin")
    public ApiResponse<List<AdminBlogArticleResponse>> listArticles() {
        return ApiResponse.ok("Blog articles retrieved", adminBlogService.listArticles());
    }

    @PostMapping("/articles")
    @Operation(summary = "Create blog article")
    public ResponseEntity<ApiResponse<AdminBlogArticleResponse>> createArticle(
            @Valid @RequestBody AdminBlogArticleRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Blog article created", adminBlogService.createArticle(request)));
    }

    @PutMapping("/articles/{articleId}")
    @Operation(summary = "Update blog article")
    public ApiResponse<AdminBlogArticleResponse> updateArticle(
            @PathVariable String articleId,
            @Valid @RequestBody AdminBlogArticleRequest request
    ) {
        return ApiResponse.ok("Blog article updated", adminBlogService.updateArticle(articleId, request));
    }

    @DeleteMapping("/articles/{articleId}")
    @Operation(summary = "Delete blog article")
    public ApiResponse<AdminBlogArticleResponse> deleteArticle(@PathVariable String articleId) {
        return ApiResponse.ok("Blog article deleted", adminBlogService.deleteArticle(articleId));
    }
}
