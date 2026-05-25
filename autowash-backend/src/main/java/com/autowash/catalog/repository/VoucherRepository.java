package com.autowash.catalog.repository;

import com.autowash.catalog.entity.Voucher;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
}
