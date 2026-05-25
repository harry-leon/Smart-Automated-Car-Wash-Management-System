package com.autowash.booking.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerBookingRepository extends JpaRepository<CustomerBooking, String> {

    long countByCustomerAndStatusIn(AuthUser customer, Collection<BookingStatus> statuses);

    @EntityGraph(attributePaths = {"vehicle", "addons"})
    Optional<CustomerBooking> findByCustomerAndId(AuthUser customer, String id);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerOrderByCreatedAtDesc(AuthUser customer, Pageable pageable);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerAndStatusOrderByCreatedAtDesc(AuthUser customer, BookingStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerAndBookingDateBetweenOrderByCreatedAtDesc(AuthUser customer, LocalDate dateFrom, LocalDate dateTo, Pageable pageable);
}
