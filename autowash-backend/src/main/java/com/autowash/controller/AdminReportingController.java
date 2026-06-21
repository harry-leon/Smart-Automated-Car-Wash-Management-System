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

    @GetMapping("/accounts")
    @Operation(summary = "List user accounts for admin with filters")
    public ApiResponse<List<AdminAccountResponse>> listAccounts(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminReportingService.AccountPage accountPage =
                adminReportingService.listAccounts(role, status, searchQuery, page, limit);
        return ApiResponse.ok("Accounts retrieved", accountPage.items(), accountPage.pagination());
    }

    @GetMapping("/accounts/{accountId}")
    @Operation(summary = "Get account detail for admin")
    public ApiResponse<AdminAccountResponse> getAccountDetail(@PathVariable UUID accountId) {
        return ApiResponse.ok("Account retrieved", adminReportingService.getAccountDetail(accountId));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings for admin with filters")
    public ApiResponse<List<AdminBookingResponse>> listBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminReportingService.BookingPage bookingPage =
                adminReportingService.listBookings(status, dateFrom, dateTo, customerId, searchQuery, page, limit);
        return ApiResponse.ok("Bookings retrieved", bookingPage.items(), bookingPage.pagination());
    }

    @GetMapping("/bookings/{bookingId}")
    @Operation(summary = "Get booking detail for admin")
    public ApiResponse<com.autowash.dto.BookingDetailResponse> getBookingDetail(@PathVariable String bookingId) {
        return ApiResponse.ok("Booking retrieved", adminReportingService.getBookingDetail(bookingId));
    }

    @GetMapping("/customers/{customerId}")
    @Operation(summary = "Get customer detail for admin")
    public ApiResponse<AdminCustomerDetailResponse> getCustomerDetail(@PathVariable UUID customerId) {
        return ApiResponse.ok("Customer retrieved", adminReportingService.getCustomerDetail(customerId));
    }

    @PutMapping("/customers/{customerId}/status")
    @Operation(summary = "Update customer status for admin")
    public ApiResponse<AdminAccountResponse> updateCustomerStatus(
            @PathVariable UUID customerId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ApiResponse.ok("Customer status updated", adminReportingService.updateCustomerStatus(customerId, request.status()));
    }

    @PutMapping("/customers/{customerId}/role")
    @Operation(summary = "Update customer role for admin")
    public ApiResponse<UpdateAdminCustomerRoleResponse> updateCustomerRole(
            @PathVariable UUID customerId,
            @Valid @RequestBody UpdateAdminCustomerRoleRequest request
    ) {
        return ApiResponse.ok(
                "Customer role updated",
                adminReportingService.updateCustomerRole(customerId, request.role())
        );
    }

    @GetMapping("/customers/{customerId}/wash-sessions")
    @Operation(summary = "List completed wash sessions for a customer")
    public ApiResponse<List<AdminWashHistoryResponse>> getWashSessions(
            @PathVariable UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminReportingService.WashHistoryPage historyPage =
                adminReportingService.getWashHistory(customerId, dateFrom, dateTo, page, limit);
        return ApiResponse.ok("Customer wash sessions retrieved", historyPage.items(), historyPage.pagination());
    }

    @GetMapping("/customers/{customerId}/vehicles")
    @Operation(summary = "List vehicles for a customer")
    public ApiResponse<List<AdminCustomerVehicleResponse>> getCustomerVehicles(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminReportingService.CustomerVehiclePage vehiclePage =
                adminReportingService.getCustomerVehicles(customerId, page, limit);
        return ApiResponse.ok("Customer vehicles retrieved", vehiclePage.items(), vehiclePage.pagination());
    }

    @GetMapping("/operations/dashboard")
    @Operation(summary = "Get admin operations dashboard")
    public ApiResponse<AdminOperationsDashboardResponse> getOperationsDashboard() {
        return ApiResponse.ok("Operations dashboard retrieved", adminReportingService.getOperationsDashboard());
    }

    @PostMapping("/staff")
    @Operation(summary = "Create staff account")
    public ApiResponse<AdminAccountResponse> createStaff(@Valid @RequestBody CreateAdminStaffRequest request) {
        return ApiResponse.ok("Staff created", adminReportingService.createStaff(request));
    }

    @PutMapping("/staff/{staffId}")
    @Operation(summary = "Update staff account")
    public ApiResponse<AdminAccountResponse> updateStaff(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateAdminStaffRequest request
    ) {
        return ApiResponse.ok("Staff updated", adminReportingService.updateStaff(staffId, request));
    }

    @GetMapping("/staff")
    @Operation(summary = "List staff accounts")
    public ApiResponse<List<AdminAccountResponse>> listStaff() {
        return ApiResponse.ok("Staff retrieved", adminReportingService.listStaff());
    }

    @PutMapping("/staff/{staffId}/status")
    @Operation(summary = "Update staff status")
    public ApiResponse<AdminAccountResponse> updateStaffStatus(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ApiResponse.ok("Staff status updated", adminReportingService.updateStaffStatus(staffId, request.status()));
    }

    @DeleteMapping("/staff/{staffId}")
    @Operation(summary = "Delete staff account")
    public ApiResponse<AdminAccountResponse> deleteStaff(@PathVariable UUID staffId) {
        return ApiResponse.ok("Staff deleted", adminReportingService.deleteStaff(staffId));
    }

    @GetMapping("/staff/{staffId}/workload")
    @Operation(summary = "Get staff workload")
    public ApiResponse<AdminStaffWorkloadResponse> getStaffWorkload(@PathVariable UUID staffId) {
        return ApiResponse.ok("Staff workload retrieved", adminReportingService.getStaffWorkload(staffId));
    }

    @GetMapping("/customers/{customerId}/wash-history")
    @Operation(summary = "List completed wash sessions for a customer (alias)")
    public ApiResponse<List<AdminWashHistoryResponse>> getWashHistory(
            @PathVariable UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        return getWashSessions(customerId, dateFrom, dateTo, page, limit);
    }

    @GetMapping("/customers/{customerId}/point-transactions")
    @Operation(summary = "List point transactions for a customer")
    public ApiResponse<List<PointTransactionResponse>> getPointTransactions(
            @PathVariable UUID customerId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        LoyaltyService.TransactionPage transactionPage =
                adminReportingService.getPointHistory(customerId, type, dateFrom, dateTo, page, limit);
        return ApiResponse.ok("Customer point transactions retrieved", transactionPage.items(), transactionPage.pagination());
    }

    @GetMapping("/customers/{customerId}/tier-history")
    @Operation(summary = "List loyalty tier history for a customer")
    public ApiResponse<List<AdminTierHistoryResponse>> getTierHistory(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminReportingService.TierHistoryPage tierHistoryPage =
                adminReportingService.getTierHistory(customerId, page, limit);
        return ApiResponse.ok("Customer tier history retrieved", tierHistoryPage.items(), tierHistoryPage.pagination());
    }

    @GetMapping("/customers/{customerId}/point-history")
    @Operation(summary = "List point transactions for a customer (alias)")
    public ApiResponse<List<PointTransactionResponse>> getPointHistory(
            @PathVariable UUID customerId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        return getPointTransactions(customerId, type, dateFrom, dateTo, page, limit);
    }
}
