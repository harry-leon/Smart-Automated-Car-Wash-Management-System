package com.autowash.booking.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"customer", "vehicle"})
    @Query("""
            select booking from CustomerBooking booking
            where (:statusFilter = false or booking.status in :statuses)
              and (:customerId is null or booking.customer.id = :customerId)
              and (:dateFrom is null or booking.bookingDate >= :dateFrom)
              and (:dateTo is null or booking.bookingDate <= :dateTo)
              and (
                    :searchQuery is null
                    or lower(booking.id) like lower(concat('%', :searchQuery, '%'))
                    or lower(booking.customer.fullName) like lower(concat('%', :searchQuery, '%'))
                    or lower(booking.customer.phone) like lower(concat('%', :searchQuery, '%'))
                    or lower(booking.vehicle.plate) like lower(concat('%', :searchQuery, '%'))
              )
            """)
    Page<CustomerBooking> searchAdmin(
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("statusFilter") boolean statusFilter,
            @Param("customerId") UUID customerId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("searchQuery") String searchQuery,
            Pageable pageable
    );

    @Query("select count(booking) from CustomerBooking booking where booking.customer = :customer")
    long countByCustomer(@Param("customer") AuthUser customer);

    @Query("select count(booking) from CustomerBooking booking where booking.customer = :customer and booking.status = :status")
    long countByCustomerAndStatus(@Param("customer") AuthUser customer, @Param("status") BookingStatus status);

    @Query("select coalesce(sum(booking.finalAmount), 0) from CustomerBooking booking where booking.customer = :customer and booking.status = :status")
    long sumFinalAmountByCustomerAndStatus(@Param("customer") AuthUser customer, @Param("status") BookingStatus status);

    Optional<CustomerBooking> findFirstByCustomerOrderByCreatedAtDesc(AuthUser customer);
}
