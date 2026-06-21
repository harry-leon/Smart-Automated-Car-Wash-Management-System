package com.autowash.repository;

import com.autowash.entity.BookingPromotion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingPromotionRepository extends JpaRepository<BookingPromotion, BookingPromotion.BookingPromotionId> {
    List<BookingPromotion> findByBooking_Id(UUID bookingId);
}
