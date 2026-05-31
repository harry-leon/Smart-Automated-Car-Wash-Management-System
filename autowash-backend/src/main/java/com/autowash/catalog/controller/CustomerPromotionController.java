package com.autowash.catalog.controller;

import com.autowash.catalog.dto.CustomerPromotionResponse;
import com.autowash.catalog.dto.PromotionResponse;
import com.autowash.catalog.service.CustomerPromotionService;
import com.autowash.catalog.service.PromotionService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@Tag(name = "Customer Promotions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerPromotionController {

    private final CustomerPromotionService customerPromotionService;
    private final PromotionService promotionService;

    public CustomerPromotionController(CustomerPromotionService customerPromotionService, PromotionService promotionService) {
        this.customerPromotionService = customerPromotionService;
        this.promotionService = promotionService;
    }

    @GetMapping("/api/v1/promotions")
    @Operation(summary = "List active promotions available to the current customer")
    public ApiResponse<List<PromotionResponse>> listActivePromotions(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        PromotionService.PromotionPage promotionPage = promotionService.listActiveForCurrentCustomer(page, limit);
        return ApiResponse.ok("Promotions retrieved", promotionPage.items(), promotionPage.pagination());
    }

    @GetMapping("/api/v1/promotions/active")
    @Operation(summary = "List active promotions available to the current customer (legacy shape)")
    public ApiResponse<List<CustomerPromotionResponse>> listActivePromotionsLegacy() {
        return ApiResponse.ok("Active promotions retrieved", customerPromotionService.listActivePromotions());
    }
}
