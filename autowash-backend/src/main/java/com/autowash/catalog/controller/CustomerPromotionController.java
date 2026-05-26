package com.autowash.catalog.controller;

import com.autowash.catalog.dto.CustomerPromotionResponse;
import com.autowash.catalog.service.CustomerPromotionService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Customer Promotions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerPromotionController {

    private final CustomerPromotionService customerPromotionService;

    public CustomerPromotionController(CustomerPromotionService customerPromotionService) {
        this.customerPromotionService = customerPromotionService;
    }

    @GetMapping("/api/v1/promotions/active")
    @Operation(summary = "List active promotions available to the current customer")
    public ApiResponse<List<CustomerPromotionResponse>> listActivePromotions() {
        return ApiResponse.ok("Active promotions retrieved", customerPromotionService.listActivePromotions());
    }
}
