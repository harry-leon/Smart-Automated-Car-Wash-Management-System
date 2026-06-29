package com.autowash.controller;

import com.autowash.dto.BlogArticleDetailResponse;
import com.autowash.dto.BlogArticleSummaryResponse;
import com.autowash.service.BlogService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/blog/articles")
@Tag(name = "Blog")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    @Operation(summary = "List published blog articles")
    public ApiResponse<List<BlogArticleSummaryResponse>> listArticles(
            @RequestParam(defaultValue = "10") @Min(1) @Max(20) int limit
    ) {
        return ApiResponse.ok("Blog articles retrieved", blogService.listPublishedArticles(limit));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get published blog article by slug")
    public ApiResponse<BlogArticleDetailResponse> getArticle(@PathVariable String slug) {
        return ApiResponse.ok("Blog article retrieved", blogService.getPublishedArticle(slug));
    }
}
