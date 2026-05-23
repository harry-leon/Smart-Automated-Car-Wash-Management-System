package com.autowash.admin.presentation.dto;

import java.time.Instant;
import java.util.List;

public record AdminDashboardMetricsResponse(
        Metrics metrics,
        List<RecentBooking> recentBookings,
        List<TopPackage> topPackages,
        SeededAccounts seededAccounts,
        Instant generatedAt
) {

    public record Metrics(
            int totalBookings,
            int completedBookings,
            int pendingBookings,
            int cancelledBookings,
            long totalRevenue,
            long averageOrderValue,
            long totalCustomers,
            int newCustomersThisMonth,
            int loyaltyPointsIssued,
            int loyaltyPointsRedeemed,
            int activePromotions,
            int noShowCount,
            double noShowRate
    ) {
    }

    public record RecentBooking(
            String bookingId,
            String customerName,
            long amount,
            String status,
            Instant date
    ) {
    }

    public record TopPackage(
            String packageId,
            String name,
            int bookingCount,
            long revenue
    ) {
    }

    public record SeededAccounts(
            long adminCount,
            long staffCount
    ) {
    }
}
