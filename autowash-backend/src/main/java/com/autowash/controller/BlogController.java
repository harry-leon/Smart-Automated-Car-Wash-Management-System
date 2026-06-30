package com.autowash.controller;

import com.autowash.dto.BlogArticleResponse;
import com.autowash.dto.BlogCategoryResponse;
import com.autowash.service.BlogService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/blog")
@Tag(name = "Blog")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/categories")
    @Operation(summary = "List blog categories")
    public ApiResponse<List<BlogCategoryResponse>> listCategories() {
        return ApiResponse.ok("Blog categories retrieved", blogService.listCategories());
    }

    @GetMapping("/articles")
    @Operation(summary = "List published blog articles")
    public ApiResponse<List<BlogArticleResponse>> listPublishedArticles() {
        return ApiResponse.ok("Blog articles retrieved", blogService.listPublishedArticles());
    }

    @GetMapping("/articles/{slug}")
    @Operation(summary = "Get published blog article by slug")
    public ApiResponse<BlogArticleResponse> getPublishedArticle(@PathVariable String slug) {
        return ApiResponse.ok("Blog article retrieved", blogService.getPublishedArticle(slug));
    }
}
