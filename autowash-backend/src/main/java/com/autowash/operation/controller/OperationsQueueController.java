package com.autowash.operation.controller;

import com.autowash.operation.dto.OperationsQueueResponse;
import com.autowash.operation.service.OperationsService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations")
@Tag(name = "Operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class OperationsQueueController {

    private final OperationsService operationsService;

    public OperationsQueueController(OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping("/queue")
    @Operation(summary = "Get staff operations queue")
    public ApiResponse<OperationsQueueResponse> getQueue() {
        return ApiResponse.ok("Operations queue retrieved", operationsService.getQueue());
    }
}
