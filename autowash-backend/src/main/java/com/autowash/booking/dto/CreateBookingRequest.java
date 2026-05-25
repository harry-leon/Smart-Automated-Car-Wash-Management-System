package com.autowash.booking.dto;

import com.autowash.booking.entity.PaymentMethod;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
