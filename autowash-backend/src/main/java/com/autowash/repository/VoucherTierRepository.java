package com.autowash.repository;

import com.autowash.entity.VoucherTier;
import com.autowash.entity.enums.LoyaltyTier;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherTierRepository extends JpaRepository<VoucherTier, VoucherTier.VoucherTierId> {
    List<VoucherTier> findByVoucherId(UUID voucherId);

    boolean existsByVoucherIdAndTier(UUID voucherId, LoyaltyTier tier);

    void deleteByVoucherId(UUID voucherId);
}
