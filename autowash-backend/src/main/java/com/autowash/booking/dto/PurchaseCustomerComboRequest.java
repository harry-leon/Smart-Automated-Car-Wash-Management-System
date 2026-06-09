package com.autowash.booking.dto;

import com.autowash.booking.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PurchaseCustomerComboRequest(
        @NotBlank(message = "Combo is required")
        String comboId,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod
) {
}