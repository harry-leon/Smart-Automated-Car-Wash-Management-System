package com.autowash.service;

import com.autowash.dto.CreateReviewRequest;
import com.autowash.dto.ReviewResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse submitReview(CreateReviewRequest request);
    List<ReviewResponse> listFeaturedReviews(int limit);
}
