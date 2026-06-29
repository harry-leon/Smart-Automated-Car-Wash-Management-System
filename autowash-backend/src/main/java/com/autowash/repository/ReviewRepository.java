package com.autowash.repository;

import com.autowash.entity.Booking;
import com.autowash.entity.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByBooking(Booking booking);

    List<Review> findByFeaturedTrueOrderByCreatedAtDesc(Pageable pageable);
}
