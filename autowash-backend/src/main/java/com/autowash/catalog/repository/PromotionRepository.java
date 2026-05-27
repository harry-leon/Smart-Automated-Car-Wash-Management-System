package com.autowash.catalog.repository;

import com.autowash.catalog.entity.Promotion;
import com.autowash.catalog.entity.PromotionStatus;
import com.autowash.catalog.entity.PromotionTargetingMode;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PromotionRepository extends JpaRepository<Promotion, String> {

    Page<Promotion> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            select p from Promotion p
            where p.status = :status
              and p.startDate <= :now
              and p.endDate >= :now
              and (
                    p.targetingMode = :allTiers
                    or concat(',', coalesce(p.applicableTiersCsv, ''), ',') like concat('%,', :tier, ',%')
              )
            order by p.endDate asc, p.createdAt desc
            """)
    Page<Promotion> findActiveForTier(
            @Param("now") Instant now,
            @Param("tier") String tier,
            @Param("status") PromotionStatus status,
            @Param("allTiers") PromotionTargetingMode allTiers,
            Pageable pageable
    );
}
