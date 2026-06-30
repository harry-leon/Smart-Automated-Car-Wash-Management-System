package com.autowash.controller;

import com.autowash.dto.ReviewResponse;
import com.autowash.dto.UpdateReviewFeaturedRequest;
import com.autowash.service.ReviewService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/reviews")
@Tag(name = "Admin Reviews")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "List reviews for admin")
    public ApiResponse<List<ReviewResponse>> listReviews() {
        return ApiResponse.ok("Reviews retrieved", reviewService.listAdminReviews());
    }

    @PatchMapping("/{reviewId}/featured")
    @Operation(summary = "Feature or unfeature a review")
    public ApiResponse<ReviewResponse> updateFeatured(
            @PathVariable String reviewId,
            @Valid @RequestBody UpdateReviewFeaturedRequest request
    ) {
        return ApiResponse.ok("Review updated", reviewService.updateFeatured(reviewId, request.featured()));
    }
}
