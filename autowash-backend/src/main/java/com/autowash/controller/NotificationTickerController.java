package com.autowash.controller;

import com.autowash.dto.TickerNotificationResponse;
import com.autowash.service.NotificationService;
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
@Tag(name = "Notification Ticker")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class NotificationTickerController {

    private final NotificationService notificationService;

    public NotificationTickerController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/api/v1/notifications/ticker")
    @Operation(summary = "List marquee ticker notifications for the current customer")
    public ApiResponse<List<TickerNotificationResponse>> listTickerItems(
            @RequestParam(defaultValue = "10") @Min(1) @Max(30) int limit
    ) {
        return ApiResponse.ok("Ticker notifications retrieved", notificationService.listTickerNotifications(limit));
    }
}
