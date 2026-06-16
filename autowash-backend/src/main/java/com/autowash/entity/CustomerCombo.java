package com.autowash.entity;

import com.autowash.enums.CustomerComboStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_combos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerCombo {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser customer;

    @Column(name = "combo_id", nullable = false)
    private UUID comboId;

    @Column(name = "total_usages", nullable = false)
    private int totalUsages;

    @Column(name = "remaining_usages", nullable = false)
    private int remainingUsages;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerComboStatus status;

    @Column(name = "activated_at", nullable = false)
    private Instant activatedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
