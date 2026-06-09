package com.autowash.catalog.controller;

import com.autowash.catalog.dto.AdminVoucherRedemptionResponse;
import com.autowash.catalog.dto.AdminVoucherResponse;
import com.autowash.catalog.service.AdminVoucherService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/vouchers")
@Tag(name = "Admin Vouchers")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVoucherController {

    private final AdminVoucherService adminVoucherService;

    public AdminVoucherController(AdminVoucherService adminVoucherService) {
        this.adminVoucherService = adminVoucherService;
    }

    @GetMapping
    @Operation(summary = "List vouchers for admin")
    public ApiResponse<List<AdminVoucherResponse>> listVouchers() {
        return ApiResponse.ok("Vouchers retrieved", adminVoucherService.listVouchers());
    }

    @GetMapping("/redemptions")
    @Operation(summary = "List voucher redemption history for admin")
    public ApiResponse<List<AdminVoucherRedemptionResponse>> listRedemptions(
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        AdminVoucherService.RedemptionPage redemptionPage =
                adminVoucherService.listRedemptions(searchQuery, dateFrom, dateTo, page, limit);
        return ApiResponse.ok("Voucher redemptions retrieved", redemptionPage.items(), redemptionPage.pagination());
    }
}
