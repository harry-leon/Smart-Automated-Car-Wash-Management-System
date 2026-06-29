package com.autowash.controller;

import com.autowash.dto.CompletionSummaryResponse;
import com.autowash.dto.CustomerWashTrackingResponse;
import com.autowash.service.CustomerWashTrackingService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers/wash-tracking")
@Tag(name = "Customer Wash Tracking")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerWashTrackingController {

    private final CustomerWashTrackingService washTrackingService;

    public CustomerWashTrackingController(CustomerWashTrackingService washTrackingService) {
        this.washTrackingService = washTrackingService;
    }

    @GetMapping("/active")
    @Operation(summary = "Get customer's active wash session")
    public ApiResponse<CustomerWashTrackingResponse> getActiveSession() {
        CustomerWashTrackingResponse activeSession = washTrackingService.getActiveSession();
        return ApiResponse.ok(
                activeSession == null ? "No active wash session" : "Active wash session retrieved",
                activeSession
        );
    }

    @GetMapping("/{washSessionId}")
    @Operation(summary = "Get customer wash session detail")
    public ApiResponse<CustomerWashTrackingResponse> getSession(@PathVariable UUID washSessionId) {
        return ApiResponse.ok("Wash session retrieved", washTrackingService.getSession(washSessionId));
    }

    @GetMapping("/{washSessionId}/completion-summary")
    @Operation(summary = "Get completion summary for a completed wash session")
    public ApiResponse<CompletionSummaryResponse> getCompletionSummary(@PathVariable UUID washSessionId) {
        return ApiResponse.ok("Completion summary retrieved", washTrackingService.getCompletionSummary(washSessionId));
    }
}
