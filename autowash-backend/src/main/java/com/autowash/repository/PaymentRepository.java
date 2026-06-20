package com.autowash.repository;



import com.autowash.entity.*;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByBooking(CustomerBooking booking);
    Optional<Payment> findByBookingId(UUID bookingId);
}
