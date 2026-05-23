package com.autowash.admin.application;

import com.autowash.admin.presentation.dto.AdminDashboardMetricsResponse;
import com.autowash.auth.domain.UserRole;
import com.autowash.auth.infrastructure.AuthUserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final AuthUserRepository users;

    public AdminDashboardService(AuthUserRepository users) {
        this.users = users;
    }

    public AdminDashboardMetricsResponse getMetrics() {
        return new AdminDashboardMetricsResponse(
                new AdminDashboardMetricsResponse.Metrics(
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        users.countByRole(UserRole.CUSTOMER),
                        0,
                        0,
                        0,
                        0,
                        0,
                        0.0
                ),
                List.of(),
                List.of(),
                new AdminDashboardMetricsResponse.SeededAccounts(
                        users.countByRole(UserRole.ADMIN),
                        users.countByRole(UserRole.STAFF)
                ),
                Instant.now()
        );
    }
}
