package com.autowash.service;

import com.autowash.dto.DashboardMetricsDto;
import com.autowash.entity.UserRole;
import com.autowash.repository.AuthUserRepository;
import com.autowash.entity.BookingStatus;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.entity.PromotionStatus;
import com.autowash.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service tổng hợp các chỉ số vận hành cho admin dashboard.
 */
@Service
public class AdminDashboardMetricsService {

    private final CustomerBookingRepository bookingRepository;
    private final PromotionRepository promotionRepository;
    private final AuthUserRepository authUserRepository;

    public AdminDashboardMetricsService(
            CustomerBookingRepository bookingRepository,
            PromotionRepository promotionRepository,
            AuthUserRepository authUserRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.promotionRepository = promotionRepository;
        this.authUserRepository = authUserRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getMetrics() {
        long totalBookings = bookingRepository.count();
        long totalRevenue = bookingRepository.sumFinalAmountByStatus(BookingStatus.CONFIRMED);
        long totalCustomers = authUserRepository.countByRole(UserRole.CUSTOMER);
        long activePromotions = promotionRepository.countByStatus(PromotionStatus.ACTIVE);

        return new DashboardMetricsDto(
                totalBookings,
                totalRevenue,
                totalCustomers,
                activePromotions
        );
    }
}
