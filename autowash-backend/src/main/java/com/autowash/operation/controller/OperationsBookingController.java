package com.autowash.operation.controller;

import com.autowash.operation.dto.EligibleSessionBookingResponse;
import com.autowash.operation.service.OperationsService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/operations/bookings")
@Tag(name = "Operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class OperationsBookingController {

    private final OperationsService operationsService;

    public OperationsBookingController(OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping("/eligible-sessions")
    @Operation(summary = "List confirmed bookings eligible for wash session creation")
    public ApiResponse<List<EligibleSessionBookingResponse>> listEligibleSessionBookings(
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ApiResponse.ok(
                "Eligible bookings retrieved",
                operationsService.listEligibleSessionBookings(limit)
        );
    }
}
