package com.autowash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record SystemSettingsRequest(
        @NotBlank(message = "Operating start time is required")
        @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Must be HH:mm format")
        String operatingStartTime,

        @NotBlank(message = "Operating end time is required")
        @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Must be HH:mm format")
        String operatingEndTime,

        @NotNull @Min(value = 1, message = "Must be at least 1 day")
        Integer maxAdvanceBookingDays,

        @NotNull @Min(value = 0, message = "Cannot be negative")
        Integer noShowGraceMinutes,

        @NotBlank(message = "Currency is required")
        String currency,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer earnPointsUnitAmount,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer vndPerPoint,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer minRedemptionPoints,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer maxRedemptionPoints,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer silverThreshold,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer goldThreshold,

        @NotNull @Min(value = 1, message = "Must be at least 1")
        Integer platinumThreshold,

        @NotNull @DecimalMin(value = "1.0", message = "Must be at least 1.0")
        BigDecimal silverMultiplier,

        @NotNull @DecimalMin(value = "1.0", message = "Must be at least 1.0")
        BigDecimal goldMultiplier,

        @NotNull @DecimalMin(value = "1.0", message = "Must be at least 1.0")
        BigDecimal platinumMultiplier
) {
}
