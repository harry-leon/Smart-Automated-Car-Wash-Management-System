package com.autowash.loyalty.controller;

import com.autowash.loyalty.dto.EarnPointsRequest;
import com.autowash.loyalty.dto.EarnPointsResponse;
import com.autowash.loyalty.dto.LoyaltyAccountResponse;
import com.autowash.loyalty.dto.PointTransactionResponse;
import com.autowash.loyalty.dto.RedeemPointsRequest;
import com.autowash.loyalty.dto.RedeemPointsResponse;
import com.autowash.loyalty.service.LoyaltyService;
import com.autowash.shared.dto.ApiResponse;
import com.autowash.user.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/loyalty")
@Tag(name = "Loyalty")
@SecurityRequirement(name = "bearerAuth")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final CurrentUserService currentUserService;

    public LoyaltyController(LoyaltyService loyaltyService, CurrentUserService currentUserService) {
        this.loyaltyService = loyaltyService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/account")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get current customer's loyalty account")
    public ApiResponse<LoyaltyAccountResponse> getAccount() {
        return ApiResponse.ok(
                "Loyalty account retrieved",
                loyaltyService.getAccount(currentUserService.getCurrentUser().getId())
        );
    }

    @PostMapping("/earn")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Post earn points event", description = "Internal/admin-only endpoint for manual loyalty earn replay.")
    public ApiResponse<EarnPointsResponse> earnPoints(@Valid @RequestBody EarnPointsRequest request) {
        return ApiResponse.ok(
                "Loyalty points posted",
                loyaltyService.postEarnTransaction(request.customerId(), request.sessionId())
        );
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Redeem current customer's loyalty points")
    public ApiResponse<RedeemPointsResponse> redeemPoints(@Valid @RequestBody RedeemPointsRequest request) {
        return ApiResponse.ok(
                "Loyalty points redeemed",
                loyaltyService.redeemPoints(
                        currentUserService.getCurrentUser().getId(),
                        request.pointsToRedeem(),
                        request.referenceId()
                )
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List current customer's point transactions")
    public ApiResponse<List<PointTransactionResponse>> getHistory(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        LoyaltyService.TransactionPage transactionPage = loyaltyService.getTransactionHistory(
                currentUserService.getCurrentUser().getId(),
                type,
                dateFrom,
                dateTo,
                page,
                limit
        );
        return ApiResponse.ok("Loyalty transactions retrieved", transactionPage.items(), transactionPage.pagination());
    }
}
