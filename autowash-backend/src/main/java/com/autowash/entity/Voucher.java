package com.autowash.entity;

import com.autowash.entity.enums.DiscountType;
import com.autowash.entity.enums.ActiveStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "vouchers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Voucher {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "discount_type", nullable = false, columnDefinition = "discount_type")
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private long discountValue;

    @Column(name = "min_order_amount", nullable = false)
    private long minOrderAmount;

    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    @Column(name = "new_customer_only", nullable = false)
    private boolean newCustomerOnly;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "active_status")
    private ActiveStatus status;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public Voucher(String code, String name, DiscountType discountType, long discountValue, long minOrderAmount, Long maxDiscountAmount, Integer usageLimit, boolean newCustomerOnly, Instant startAt, Instant endAt, ActiveStatus status) {
        this.code = code;
        this.name = name;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscountAmount = maxDiscountAmount;
        this.usageLimit = usageLimit;
        this.newCustomerOnly = newCustomerOnly;
        this.startAt = startAt;
        this.endAt = endAt;
        this.status = status;
        this.usedCount = 0;
    }

    public boolean isUsageLimitReached() {
        return usageLimit != null && usedCount >= usageLimit;
    }

    public void recordUse() {
        this.usedCount++;
    }
}
