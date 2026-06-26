package com.autowash.controller;

import com.autowash.dto.AdminBookingResponse;
import com.autowash.dto.AdminBusinessHealthReportResponse;
import com.autowash.dto.AdminAccountResponse;
import com.autowash.dto.AdminCustomerDetailResponse;
import com.autowash.dto.AdminCustomerVehicleResponse;
import com.autowash.dto.AdminOperationsDashboardResponse;
import com.autowash.dto.AdminStaffWorkloadResponse;
import com.autowash.dto.AdminTierHistoryResponse;
import com.autowash.dto.AdminWashHistoryResponse;
import com.autowash.dto.CreateAdminStaffRequest;
import com.autowash.dto.UpdateAdminStaffRequest;
import com.autowash.dto.UpdateAdminCustomerRoleRequest;
import com.autowash.dto.UpdateAdminCustomerRoleResponse;
import com.autowash.dto.UpdateUserStatusRequest;
import com.autowash.service.AdminReportingService;
import com.autowash.dto.PointTransactionResponse;
import com.autowash.service.LoyaltyService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Reporting")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportingController {

    private final AdminReportingService adminReportingService;

    public AdminReportingController(AdminReportingService adminReportingService) {
        this.adminReportingService = adminReportingService;
    }

    @GetMapping("/reports/business-health")
    @Operation(summary = "Get executive business health report")
    public ApiResponse<AdminBusinessHealthReportResponse> getBusinessHealthReport(
            @RequestParam(defaultValue = "LAST_30_DAYS") String range,
            @RequestParam(defaultValue = "revenue") String analysisGroup,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ApiResponse.ok(
                "Business health report retrieved",
                adminReportingService.getBusinessHealthReport(range, analysisGroup, dateFrom, dateTo)
        );
    }



    @GetMapping("/operations/dashboard")
    @Operation(summary = "Get admin operations dashboard")
    public ApiResponse<AdminOperationsDashboardResponse> getOperationsDashboard() {
        return ApiResponse.ok("Operations dashboard retrieved", adminReportingService.getOperationsDashboard());
    }


}
