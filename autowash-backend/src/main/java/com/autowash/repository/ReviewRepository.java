package com.autowash.repository;

import com.autowash.entity.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByBookingId(UUID bookingId);
    List<Review> findByFeaturedTrueOrderByCreatedAtDesc();
}
