package com.autowash.admin.presentation;

import com.autowash.admin.application.AdminDashboardService;
import com.autowash.admin.presentation.dto.AdminDashboardMetricsResponse;
import com.autowash.shared.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/metrics")
    public ApiResponse<AdminDashboardMetricsResponse> getMetrics() {
        return ApiResponse.success(HttpStatus.OK, "Dashboard metrics retrieved", adminDashboardService.getMetrics());
    }
}
