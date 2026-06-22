package com.autowash.entity;

import com.autowash.entity.enums.LoyaltyTier;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.io.Serializable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "voucher_tiers")
@IdClass(VoucherTier.VoucherTierId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoucherTier {

    @Id
    private UUID voucherId;

    @Id
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "loyalty_tier")
    private LoyaltyTier tier;

    public VoucherTier(UUID voucherId, LoyaltyTier tier) {
        this.voucherId = voucherId;
        this.tier = tier;
    }

    @Getter
    @NoArgsConstructor
    public static class VoucherTierId implements Serializable {
        private UUID voucherId;
        private LoyaltyTier tier;
    }
}
