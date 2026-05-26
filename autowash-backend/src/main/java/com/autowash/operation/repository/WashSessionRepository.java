package com.autowash.operation.repository;

import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WashSessionRepository extends JpaRepository<WashSession, UUID> {

    boolean existsByBookingIdAndStatusIn(String bookingId, Collection<WashSessionStatus> statuses);

    @EntityGraph(attributePaths = {"booking", "booking.customer"})
    Optional<WashSession> findWithBookingById(UUID id);
}
