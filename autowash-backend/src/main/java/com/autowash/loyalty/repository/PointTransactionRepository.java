package com.autowash.loyalty.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.loyalty.entity.PointTransaction;
import com.autowash.loyalty.entity.PointTransactionType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {

    Optional<PointTransaction> findByTypeAndReferenceId(PointTransactionType type, String referenceId);

    long countByTypeAndReferenceId(PointTransactionType type, String referenceId);

    @Query("""
            select pt from PointTransaction pt
            where pt.customer = :customer
              and (:type is null or pt.type = :type)
              and (:dateFrom is null or pt.createdAt >= :dateFrom)
              and (:dateTo is null or pt.createdAt <= :dateTo)
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
}
