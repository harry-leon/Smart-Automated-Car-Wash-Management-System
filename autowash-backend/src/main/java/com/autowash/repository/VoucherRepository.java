package com.autowash.repository;

import com.autowash.entity.Voucher;
import com.autowash.entity.enums.PromotionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    Optional<Voucher> findByCode(String code);
    boolean existsByCode(String code);
    List<Voucher> findByStatusAndEndAtAfterOrderByEndAtAsc(PromotionStatus status, Instant instant);
}
