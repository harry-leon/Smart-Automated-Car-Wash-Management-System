package com.autowash.booking.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CreateBookingResponse(
        String bookingId,
        String customerId,
        String vehicleId,
        String vehiclePlate,
        String packageId,
        String packageName,
        List<AddonSelectionResponse> addons,
        long basePrice,
        long addonsTotal,
        long voucherDiscount,
        long finalAmount,
        LocalDate bookingDate,
        String bookingTime,
        int estimatedDuration,
        String paymentMethod,
        String paymentStatus,
        String status,
        Instant createdAt,
        String confirmationNumber,
        String comboId,
        String customerComboId,
        boolean comboPurchased
) {
}
