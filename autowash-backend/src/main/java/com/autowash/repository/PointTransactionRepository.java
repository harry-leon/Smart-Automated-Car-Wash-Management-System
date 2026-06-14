package com.autowash.repository;

import com.autowash.entity.AuthUser;
import com.autowash.entity.PointTransaction;
import com.autowash.entity.PointTransactionType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {

    Page<PointTransaction> findByCustomer(AuthUser customer, Pageable pageable);

    Optional<PointTransaction> findByTypeAndReferenceId(PointTransactionType type, String referenceId);

    long countByTypeAndReferenceId(PointTransactionType type, String referenceId);

    @Query("""
            select pt from PointTransaction pt
            where pt.customer = :customer
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

    @Query("select coalesce(sum(pt.points), 0) from PointTransaction pt where pt.customer = :customer and pt.type = :type")
    long sumPointsByCustomerAndType(@Param("customer") AuthUser customer, @Param("type") PointTransactionType type);

    @Query("""
            select pt from PointTransaction pt
            where pt.type = :type
              and (:#{#searchQuery == null} = true or lower(pt.referenceId) like :searchQuery
                   or lower(pt.customer.fullName) like :searchQuery
                   or lower(pt.customer.phone) like :searchQuery
                   or lower(pt.customer.email) like :searchQuery)
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
