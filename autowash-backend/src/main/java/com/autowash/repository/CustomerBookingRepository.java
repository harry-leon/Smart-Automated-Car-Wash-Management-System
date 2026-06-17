package com.autowash.repository;

import com.autowash.entity.AuthUser;
import com.autowash.enums.BookingStatus;
import com.autowash.entity.CustomerBooking;
import com.autowash.enums.WashSessionStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
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

    long countByAssignedStaffAndStatusIn(AuthUser assignedStaff, Collection<BookingStatus> statuses);

    long countByAssignedStaffAndStatus(AuthUser assignedStaff, BookingStatus status);

    @Query("select coalesce(sum(booking.finalAmount), 0) from CustomerBooking booking where booking.assignedStaff = :staff and booking.status = :status")
    long sumFinalAmountByAssignedStaffAndStatus(@Param("staff") AuthUser staff, @Param("status") BookingStatus status);

    @EntityGraph(attributePaths = {"vehicle", "addons"})
    Optional<CustomerBooking> findByCustomerAndId(AuthUser customer, String id);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerOrderByCreatedAtDesc(AuthUser customer, Pageable pageable);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerAndStatusOrderByCreatedAtDesc(AuthUser customer, BookingStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"vehicle"})
    Page<CustomerBooking> findByCustomerAndBookingDateBetweenOrderByCreatedAtDesc(AuthUser customer, LocalDate dateFrom, LocalDate dateTo, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "vehicle", "assignedStaff"})
    @Query("""
            select booking from CustomerBooking booking
            where (:statusFilter = false or booking.status in :statuses)
              and (:customerId is null or booking.customer.id = :customerId)
              and (:dateFrom is null or booking.bookingDate >= :dateFrom)
              and (:dateTo is null or booking.bookingDate <= :dateTo)
              and (
                    :searchLike is null
                    or lower(booking.id) like :searchLike
                    or lower(booking.customer.fullName) like :searchLike
                    or lower(booking.customer.phone) like :searchLike
                    or lower(booking.vehicle.plate) like :searchLike
              )
            """)
    Page<CustomerBooking> searchAdmin(
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("statusFilter") boolean statusFilter,
            @Param("customerId") UUID customerId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("searchLike") String searchLike,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"customer", "vehicle", "assignedStaff"})
    @Query("""
            select booking from CustomerBooking booking
            where booking.assignedStaff = :staff
              and (:statusFilter = false or booking.status in :statuses)
              and (:dateFrom is null or booking.bookingDate >= :dateFrom)
              and (:dateTo is null or booking.bookingDate <= :dateTo)
            """)
    Page<CustomerBooking> searchAssignedStaffBookings(
            @Param("staff") AuthUser staff,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("statusFilter") boolean statusFilter,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    @Query("select count(booking) from CustomerBooking booking where booking.customer = :customer")
    long countByCustomer(@Param("customer") AuthUser customer);

    @Query("select count(booking) from CustomerBooking booking where booking.customer = :customer and booking.status = :status")
    long countByCustomerAndStatus(@Param("customer") AuthUser customer, @Param("status") BookingStatus status);

    @Query("select coalesce(sum(booking.finalAmount), 0) from CustomerBooking booking where booking.customer = :customer and booking.status = :status")
    long sumFinalAmountByCustomerAndStatus(@Param("customer") AuthUser customer, @Param("status") BookingStatus status);

    Optional<CustomerBooking> findFirstByCustomerOrderByCreatedAtDesc(AuthUser customer);

    long countByStatus(BookingStatus status);

    @Query("select coalesce(sum(b.finalAmount), 0) from CustomerBooking b where b.status = :status")
    long sumFinalAmountByStatus(@Param("status") BookingStatus status);

    @EntityGraph(attributePaths = {"customer", "vehicle", "assignedStaff"})
    @Query("""
            select booking from CustomerBooking booking
            where booking.status = :status
              and not exists (
                    select session.id from WashSession session
                    where session.booking = booking
                      and session.status in :activeStatuses
              )
            order by booking.bookingDate asc, booking.bookingTime asc, booking.createdAt desc
            """)
    List<CustomerBooking> findEligibleForOperationsSession(
            @Param("status") BookingStatus status,
            @Param("activeStatuses") Collection<WashSessionStatus> activeStatuses,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"customer", "vehicle", "assignedStaff"})
    @Query("""
            select booking from CustomerBooking booking
            where booking.status = :status
              and booking.assignedStaff = :staff
              and not exists (
                    select session.id from WashSession session
                    where session.booking = booking
                      and session.status in :activeStatuses
              )
            order by booking.bookingDate asc, booking.bookingTime asc, booking.createdAt desc
            """)
    List<CustomerBooking> findEligibleForAssignedStaffOperationsSession(
            @Param("staff") AuthUser staff,
            @Param("status") BookingStatus status,
            @Param("activeStatuses") Collection<WashSessionStatus> activeStatuses,
            Pageable pageable
    );
}
