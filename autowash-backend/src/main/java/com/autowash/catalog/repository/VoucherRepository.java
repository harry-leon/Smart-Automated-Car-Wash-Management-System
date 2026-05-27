package com.autowash.catalog.repository;

import com.autowash.catalog.entity.Voucher;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByActiveTrueAndExpiresAtAfterOrderByExpiresAtAsc(Instant instant);
}
