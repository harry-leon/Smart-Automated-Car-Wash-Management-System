package com.autowash.repository;

import com.autowash.entity.BookingStatusHistory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, Long> {
    boolean existsByBooking_IdAndNewStatus(UUID bookingId, String newStatus);
    List<BookingStatusHistory> findByBooking_IdOrderByChangedAtAsc(UUID bookingId);
}
