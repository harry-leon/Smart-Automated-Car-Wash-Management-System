package com.autowash.repository;

import com.autowash.entity.BookingOtpChallenge;
import com.autowash.entity.BookingOtpChallengeStatus;
import com.autowash.entity.CustomerBooking;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingOtpChallengeRepository extends JpaRepository<BookingOtpChallenge, UUID> {

    Optional<BookingOtpChallenge> findFirstByBookingAndStatusOrderBySentAtDesc(CustomerBooking booking, BookingOtpChallengeStatus status);

    List<BookingOtpChallenge> findByBookingAndStatus(CustomerBooking booking, BookingOtpChallengeStatus status);

    @EntityGraph(attributePaths = {"booking", "booking.customer"})
    List<BookingOtpChallenge> findByStatusAndExpiresAtBefore(BookingOtpChallengeStatus status, Instant expiresAt);
}
