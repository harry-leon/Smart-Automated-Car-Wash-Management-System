package com.autowash.controller;

import com.autowash.dto.NotificationTickerResponse;
import com.autowash.service.NotificationService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Public Notifications")
public class PublicNotificationController {

    private final NotificationService notificationService;

    public PublicNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/ticker")
    @Operation(summary = "Get marquee ticker notifications")
    public ApiResponse<NotificationTickerResponse> getTicker() {
        return ApiResponse.ok("Ticker retrieved", notificationService.getTicker());
    }
}