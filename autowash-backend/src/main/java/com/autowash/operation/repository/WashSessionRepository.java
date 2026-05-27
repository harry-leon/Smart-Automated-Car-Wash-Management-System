package com.autowash.operation.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WashSessionRepository extends JpaRepository<WashSession, UUID> {

    boolean existsByBookingIdAndStatusIn(String bookingId, Collection<WashSessionStatus> statuses);

    @EntityGraph(attributePaths = {"booking", "booking.customer"})
    Optional<WashSession> findWithBookingById(UUID id);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.vehicle"})
    Page<WashSession> findByBookingCustomerAndStatusOrderByCompletedAtDesc(
            AuthUser customer,
            WashSessionStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.vehicle"})
    java.util.List<WashSession> findByBookingCustomerAndStatusOrderByCompletedAtDesc(
            AuthUser customer,
            WashSessionStatus status
    );

    @EntityGraph(attributePaths = {"booking"})
    Optional<WashSession> findFirstByBookingIdOrderByCompletedAtDesc(String bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.vehicle"})
    java.util.List<WashSession> findAllByOrderByCreatedAtDesc();
}
