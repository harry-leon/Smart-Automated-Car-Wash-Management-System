package com.autowash.controller;

import com.autowash.dto.CheckInWashSessionResponse;
import com.autowash.dto.CompleteWashSessionResponse;
import com.autowash.dto.CreateWashSessionRequest;
import com.autowash.dto.CreateWashSessionResponse;
import com.autowash.dto.EligibleSessionBookingResponse;
import com.autowash.dto.OperationsQueueResponse;
import com.autowash.dto.QueueWashSessionResponse;
import com.autowash.dto.StaffDashboardSummaryResponse;
import com.autowash.dto.StaffOptionResponse;
import com.autowash.dto.StartWashSessionResponse;
import com.autowash.service.OperationsService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/operations/sessions")
@Tag(name = "Operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class OperationsController {

    private final OperationsService operationsService;

    public OperationsController(OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @PostMapping
    @Operation(summary = "Create wash session from a booking")
    public ResponseEntity<ApiResponse<CreateWashSessionResponse>> createSession(
            @Valid @RequestBody CreateWashSessionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Wash session created", operationsService.createSession(request)));
    }

    @PostMapping("/{sessionId}/queue")
    @Operation(summary = "Queue wash session")
    public ApiResponse<QueueWashSessionResponse> queueSession(@PathVariable UUID sessionId) {
        return ApiResponse.ok("Wash session queued", operationsService.queueSession(sessionId));
    }

    @PostMapping("/{sessionId}/check-in")
    @Operation(summary = "Check in wash session")
    public ApiResponse<CheckInWashSessionResponse> checkInSession(@PathVariable UUID sessionId) {
        return ApiResponse.ok("Wash session checked in", operationsService.checkInSession(sessionId));
    }

    @PostMapping("/{sessionId}/start")
    @Operation(summary = "Start wash session")
    public ApiResponse<StartWashSessionResponse> startSession(@PathVariable UUID sessionId) {
        return ApiResponse.ok("Wash session started", operationsService.startSession(sessionId));
    }

    @PostMapping("/{sessionId}/complete")
    @Operation(summary = "Complete wash session")
    public ApiResponse<CompleteWashSessionResponse> completeSession(@PathVariable UUID sessionId) {
        return ApiResponse.ok("Wash session completed", operationsService.completeSession(sessionId));
    }

    @GetMapping("/queue")
    @Operation(summary = "Get operations queue")
    public ApiResponse<OperationsQueueResponse> getQueue() {
        return ApiResponse.ok("Operations queue retrieved", operationsService.getOperationsQueue());
    }

    @GetMapping("/staff/summary")
    @Operation(summary = "Get current staff summary")
    public ApiResponse<StaffDashboardSummaryResponse> getStaffSummary() {
        return ApiResponse.ok("Staff summary retrieved", operationsService.getMyStaffSummary());
    }

    @GetMapping("/staff/active")
    @Operation(summary = "List active staff")
    public ApiResponse<List<StaffOptionResponse>> listActiveStaff() {
        return ApiResponse.ok("Active staff retrieved", operationsService.listActiveStaff());
    }

    @GetMapping("/bookings/eligible-sessions")
    @Operation(summary = "List eligible bookings for wash sessions")
    public ApiResponse<List<EligibleSessionBookingResponse>> listEligibleSessions() {
        return ApiResponse.ok("Eligible sessions retrieved", operationsService.getEligibleSessionBookings(20));
    }

}
