package com.autowash.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ValidateVoucherRequest(
        @NotBlank(message = "Voucher code is required")
        @Pattern(
                regexp = "^[A-Z0-9_-]+$",
                message = "Voucher code must be uppercase and must not contain spaces"
        )
        String voucherCode,
        String packageId,
        @NotNull(message = "Amount is required")
        @Min(value = 0, message = "Amount must be non-negative")
        Long amount
) {
}
