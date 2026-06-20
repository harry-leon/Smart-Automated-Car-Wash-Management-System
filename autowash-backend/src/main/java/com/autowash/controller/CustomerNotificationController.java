package com.autowash.controller;

import com.autowash.dto.NotificationResponse;
import com.autowash.service.NotificationService;
import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers/notifications")
@Tag(name = "Customer Notifications")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerNotificationController {

    private final NotificationService notificationService;

    public CustomerNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List customer notifications")
    public ApiResponse<List<NotificationResponse>> listNotifications() {
        return ApiResponse.ok("Notifications retrieved", notificationService.listMyNotifications(50));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable UUID notificationId) {
        return ApiResponse.ok("Notification marked as read", notificationService.markAsRead(notificationId));
    }
}
