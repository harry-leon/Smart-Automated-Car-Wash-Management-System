package com.autowash.service;

import com.autowash.dto.ReviewRequest;
import com.autowash.dto.ReviewResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse submitReview(ReviewRequest request);
    List<ReviewResponse> getFeaturedReviews();
    List<ReviewResponse> listAdminReviews();
    ReviewResponse updateFeatured(String reviewId, boolean featured);
}
