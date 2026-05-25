package com.autowash.catalog.controller;

import com.autowash.catalog.dto.AddonResponse;
import com.autowash.catalog.dto.ComboResponse;
import com.autowash.catalog.dto.PackageResponse;
import com.autowash.catalog.dto.ValidateVoucherRequest;
import com.autowash.catalog.dto.ValidateVoucherResponse;
import com.autowash.catalog.service.CatalogService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@Tag(name = "Catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/api/v1/packages")
    @Operation(summary = "List available service packages")
    public ApiResponse<List<PackageResponse>> getPackages(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        CatalogService.PackagePage packagePage = catalogService.getPackages(page, limit);
        return ApiResponse.ok("Packages retrieved", packagePage.items(), packagePage.pagination());
    }

    @GetMapping("/api/v1/add-ons")
    @Operation(summary = "List available add-on services")
    public ApiResponse<List<AddonResponse>> getAddOns() {
        return ApiResponse.ok("Add-ons retrieved", catalogService.getAddons());
    }

    @GetMapping("/api/v1/combos/available")
    @Operation(summary = "List available combo packages")
    public ApiResponse<List<ComboResponse>> getAvailableCombos() {
        return ApiResponse.ok("Available combos", catalogService.getAvailableCombos());
    }

    @PostMapping("/api/v1/bookings/validate-voucher")
    @Operation(summary = "Validate voucher code before booking")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<ValidateVoucherResponse> validateVoucher(@Valid @RequestBody ValidateVoucherRequest request) {
        return ApiResponse.ok("Voucher is valid", catalogService.validateVoucher(request.voucherCode(), request.amount()));
    }
}
