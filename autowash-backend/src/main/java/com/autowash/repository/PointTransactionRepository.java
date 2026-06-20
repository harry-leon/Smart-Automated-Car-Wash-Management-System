package com.autowash.repository;

import com.autowash.entity.AuthUser;
import com.autowash.entity.CustomerBooking;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.enums.PointTransactionType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @Query("select pt from PointTransaction pt where pt.loyaltyAccount.customer = :customer")
    Page<PointTransaction> findByCustomer(@Param("customer") AuthUser customer, Pageable pageable);

    @Query("""
            select pt from PointTransaction pt
            where pt.type = :type
              and pt.booking = :booking
            """)
    Optional<PointTransaction> findByTypeAndBooking(@Param("type") PointTransactionType type, @Param("booking") CustomerBooking booking);

    @Query("""
            select count(pt) from PointTransaction pt
            where pt.type = :type
              and pt.booking = :booking
            """)
    long countByTypeAndBooking(@Param("type") PointTransactionType type, @Param("booking") CustomerBooking booking);

    @Query("""
            select pt from PointTransaction pt
            where pt.loyaltyAccount.customer = :customer
              and (:#{#type == null} = true or pt.type = :type)
              and (:#{#dateFrom == null} = true or pt.createdAt >= :dateFrom)
              and (:#{#dateTo == null} = true or pt.createdAt <= :dateTo)
            """)
    Page<PointTransaction> search(
            @Param("customer") AuthUser customer,
            @Param("type") PointTransactionType type,
            @Param("dateFrom") Instant dateFrom,
            @Param("dateTo") Instant dateTo,
            Pageable pageable
    );

    @Query("select coalesce(sum(pt.points), 0) from PointTransaction pt where pt.loyaltyAccount.customer = :customer and pt.type = :type")
    long sumPointsByCustomerAndType(@Param("customer") AuthUser customer, @Param("type") PointTransactionType type);

    @Query("""
            select pt from PointTransaction pt
            where pt.type = :type
              and (:#{#searchQuery == null} = true or lower(cast(pt.booking.id as string)) like :searchQuery
                   or lower(pt.loyaltyAccount.customer.fullName) like :searchQuery
                   or lower(pt.loyaltyAccount.customer.phone) like :searchQuery
                   or lower(pt.loyaltyAccount.customer.email) like :searchQuery)
              and (:#{#dateFrom == null} = true or pt.createdAt >= :dateFrom)
              and (:#{#dateTo == null} = true or pt.createdAt <= :dateTo)
            """)
    Page<PointTransaction> searchAdminByType(
            @Param("type") PointTransactionType type,
            @Param("searchQuery") String searchQuery,
            @Param("dateFrom") Instant dateFrom,
            @Param("dateTo") Instant dateTo,
            Pageable pageable
    );
}

