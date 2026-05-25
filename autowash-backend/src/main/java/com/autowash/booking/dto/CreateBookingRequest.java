package com.autowash.booking.dto;

import com.autowash.booking.entity.PaymentMethod;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

public record CreateBookingRequest(
        @NotBlank(message = "Vehicle is required")
        String vehicleId,
        String packageId,
        List<String> addons,
        @NotNull(message = "Booking date is required")
        @Future(message = "Booking date must be in the future")
        LocalDate bookingDate,
        @NotBlank(message = "Booking time is required")
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Booking time must be in HH:mm format")
        String bookingTime,
        String voucherCode,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        String comboId
) {
    @AssertTrue(message = "Either packageId or comboId is required")
    public boolean hasPackageOrCombo() {
        return (packageId != null && !packageId.isBlank()) || (comboId != null && !comboId.isBlank());
    }
}
