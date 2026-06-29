package com.autowash.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import com.autowash.entity.BookingStatusHistory;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, Long> {
    boolean existsByBooking_IdAndNewStatus(UUID bookingId, String newStatus);

    @EntityGraph(attributePaths = {"changedBy"})
    List<BookingStatusHistory> findByBooking_IdOrderByChangedAtAsc(UUID bookingId);
}
