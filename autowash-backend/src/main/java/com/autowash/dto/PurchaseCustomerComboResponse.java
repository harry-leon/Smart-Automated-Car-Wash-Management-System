package com.autowash.dto;

import com.autowash.enums.PaymentStatus;

import com.autowash.enums.PaymentMethod;
import java.time.Instant;

public record PurchaseCustomerComboResponse(
        String customerComboId,
        String comboId,
        String comboName,
        long amount,
        PaymentMethod paymentMethod,
        String paymentStatus,
        int totalUsages,
        int remainingUsages,
        Instant activatedAt,
        Instant expiresAt,
        Instant purchasedAt
) {
}
