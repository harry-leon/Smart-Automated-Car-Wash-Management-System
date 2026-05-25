package com.autowash.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ValidateVoucherRequest(
        @NotBlank(message = "Voucher code is required")
        String voucherCode,
        String packageId,
        @NotNull(message = "Amount is required")
        @Min(value = 0, message = "Amount must be non-negative")
        Long amount
) {
}
