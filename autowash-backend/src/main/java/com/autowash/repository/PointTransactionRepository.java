package com.autowash.repository;

import com.autowash.entity.AuthUser;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.enums.PointTransactionType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @Query("select pt from PointTransaction pt where pt.loyaltyAccount.customer = :customer")
    Page<PointTransaction> findByCustomer(@Param("customer") AuthUser customer, Pageable pageable);

    Optional<PointTransaction> findByTypeAndBookingId(PointTransactionType type, UUID bookingId);

    long countByTypeAndBookingId(PointTransactionType type, UUID bookingId);

    default Optional<PointTransaction> findByTypeAndReferenceId(PointTransactionType type, String referenceId) {
        return parseUuid(referenceId).flatMap(bookingId -> findByTypeAndBookingId(type, bookingId));
    }

    default long countByTypeAndReferenceId(PointTransactionType type, String referenceId) {
        return parseUuid(referenceId).map(bookingId -> countByTypeAndBookingId(type, bookingId)).orElse(0L);
    }

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
              and (:#{#searchQuery == null} = true or lower(str(pt.booking.id)) like :searchQuery
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

    private static Optional<UUID> parseUuid(String id) {
        try {
            return id == null || id.isBlank() ? Optional.empty() : Optional.of(UUID.fromString(id));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
}
