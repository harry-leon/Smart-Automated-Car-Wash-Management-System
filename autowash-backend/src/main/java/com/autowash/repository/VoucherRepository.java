package com.autowash.repository;

import com.autowash.entity.Voucher;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByActiveTrueAndExpiresAtAfterOrderByExpiresAtAsc(Instant instant);

    default boolean existsById(String code) {
        return code != null && findByCode(code).isPresent();
    }
}
