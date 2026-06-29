package com.autowash.service.impl;

import com.autowash.dto.CreateReviewRequest;
import com.autowash.dto.ReviewResponse;
import com.autowash.entity.Booking;
import com.autowash.entity.Review;
import com.autowash.entity.User;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.repository.BookingRepository;
import com.autowash.repository.ReviewRepository;
import com.autowash.service.CurrentUserService;
import com.autowash.service.ReviewService;
import com.autowash.shared.exception.ApiException;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final CurrentUserService currentUserService;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(
            CurrentUserService currentUserService,
            BookingRepository bookingRepository,
            ReviewRepository reviewRepository
    ) {
        this.currentUserService = currentUserService;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional
    public ReviewResponse submitReview(CreateReviewRequest request) {
        User customer = currentUserService.getCurrentUser();
        Booking booking = bookingRepository.findByCustomerAndId(customer, request.bookingId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Only completed bookings can be reviewed",
                    "BUSINESS_RULE_VIOLATION",
                    Map.of("code", "BOOKING_NOT_COMPLETED")
            );
        }

        if (reviewRepository.existsByBooking(booking)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Review already exists for this booking",
                    "RESOURCE_CONFLICT",
                    Map.of("code", "BOOKING_ALREADY_REVIEWED")
            );
        }

        Review review = reviewRepository.save(new Review(
                customer,
                booking,
                request.rating(),
                request.comment(),
                request.beforeImageUrl(),
                request.afterImageUrl()
        ));

        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> listFeaturedReviews(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        return reviewRepository.findByFeaturedTrueOrderByCreatedAtDesc(PageRequest.of(0, safeLimit)).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getId().toString())
                .bookingId(review.getBooking().getId().toString())
                .customerId(review.getCustomer().getId().toString())
                .customerName(review.getCustomer().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .beforeImageUrl(review.getBeforeImageUrl())
                .afterImageUrl(review.getAfterImageUrl())
                .featured(review.isFeatured())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
