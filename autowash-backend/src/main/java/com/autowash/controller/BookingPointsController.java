package com.autowash.controller;

import com.autowash.dto.ApplyPointsRequest;
import com.autowash.dto.ApplyPointsResponse;
import com.autowash.service.BookingService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings")
@SecurityRequirement(name = "bearerAuth")
public class BookingPointsController {

    private final BookingService bookingService;

    public BookingPointsController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/{bookingId}/apply-points")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Apply loyalty points to a booking")
    public ApiResponse<ApplyPointsResponse> applyPoints(
            @PathVariable String bookingId,
            @Valid @RequestBody ApplyPointsRequest request
    ) {
        return ApiResponse.ok("Points applied to booking", bookingService.applyPoints(bookingId, request));
    }
}
