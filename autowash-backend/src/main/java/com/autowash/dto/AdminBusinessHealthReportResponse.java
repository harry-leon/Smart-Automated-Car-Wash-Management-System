package com.autowash.dto;

import java.util.List;

public record AdminBusinessHealthReportResponse(
        Period period,
        Period previousPeriod,
        Kpis kpis,
        Trends trends,
        Breakdowns breakdowns,
        List<Insight> insights,
        TopItems topItems,
        Capabilities capabilities
) {
    public record Period(String key, String label, String dateFrom, String dateTo) {}

    public record Kpis(
            long revenueThisPeriod,
            long revenuePreviousPeriod,
            double revenueGrowthRate,
            long completedBookings,
            double completedBookingsGrowthRate,
            long averageBookingValue,
            double cancellationRate,
            long discountAssistedRevenue
    ) {}

    public record Trends(Series revenue, Series completedBookings) {}

    public record Series(List<Point> points, List<Point> previousPoints) {}

    public record Point(String label, long value) {}

    public record Breakdowns(
            Breakdown revenue,
            Breakdown service,
            Breakdown promotion,
            Breakdown channel
    ) {}

    public record Breakdown(boolean available, List<BreakdownItem> items, String message) {}

    public record BreakdownItem(String key, String label, long revenue, long bookings, double share) {}

    public record Insight(String tone, String title, String summary) {}

    public record TopItems(List<BreakdownItem> services) {}

    public record Capabilities(boolean channelAvailable, boolean promotionAttributionExact) {}
}
