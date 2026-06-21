package com.autowash.repository;

import com.autowash.entity.BookingOption;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingOptionRepository extends JpaRepository<BookingOption, BookingOption.BookingOptionId> {
    List<BookingOption> findByBooking_Id(UUID bookingId);
}
