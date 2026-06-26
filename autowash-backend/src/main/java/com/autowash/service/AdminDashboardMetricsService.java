package com.autowash.service;

import com.autowash.dto.DashboardMetricsDto;

/**
 * Service tổng hợp các chỉ số vận hành cho admin dashboard.
 */
public interface AdminDashboardMetricsService {
    DashboardMetricsDto getMetrics();
}
