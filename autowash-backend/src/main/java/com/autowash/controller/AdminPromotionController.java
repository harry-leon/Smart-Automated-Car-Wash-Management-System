package com.autowash.controller;

import com.autowash.dto.PromotionRequest;
import com.autowash.dto.PromotionResponse;
import com.autowash.service.PromotionService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/promotions")
@Tag(name = "Admin Promotions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromotionController {

    private final PromotionService promotionService;

    public AdminPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @PostMapping
    @Operation(summary = "Create promotion")
    public ResponseEntity<ApiResponse<PromotionResponse>> create(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Promotion created", promotionService.create(request)));
    }

    @GetMapping
    @Operation(summary = "List promotions for admin")
    public ApiResponse<List<PromotionResponse>> list(
            @RequestParam(name = "page", defaultValue = "1") @Min(1) int page,
            @RequestParam(name = "limit", defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        PromotionService.PromotionPage promotionPage = promotionService.listAdmin(page, limit);
        return ApiResponse.ok("Promotions retrieved", promotionPage.items(), promotionPage.pagination());
    }

    @GetMapping("/{promotionId}")
    @Operation(summary = "Get promotion by id")
    public ApiResponse<PromotionResponse> getById(@PathVariable String promotionId) {
        return ApiResponse.ok("Promotion retrieved", promotionService.getById(promotionId));
    }

    @PutMapping("/{promotionId}")
    @Operation(summary = "Update promotion")
    public ApiResponse<PromotionResponse> update(
            @PathVariable String promotionId,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ApiResponse.ok("Promotion updated", promotionService.update(promotionId, request));
    }

    @DeleteMapping("/{promotionId}")
    @Operation(summary = "Delete promotion")
    public ApiResponse<PromotionResponse> delete(@PathVariable String promotionId) {
        return ApiResponse.ok("Promotion deleted", promotionService.delete(promotionId));
    }
}
