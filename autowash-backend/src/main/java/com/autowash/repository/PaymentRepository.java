package com.autowash.repository;

import com.autowash.entity.Booking;
import com.autowash.entity.Payment;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByBooking(Booking booking);
    Optional<Payment> findByBookingId(UUID bookingId);
}
