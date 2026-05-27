package com.autowash.loyalty.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.catalog.entity.ServiceCombo;
import com.autowash.catalog.entity.ServicePackage;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.catalog.repository.ServicePackageRepository;
import com.autowash.loyalty.dto.LoyaltyAccountResponse;
import com.autowash.loyalty.dto.LoyaltyTransactionResponse;
import com.autowash.loyalty.dto.WashHistoryItemResponse;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.user.service.CurrentUserService;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerLoyaltyService {

    private final CurrentUserService currentUserService;
    private final WashSessionRepository washSessionRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceComboRepository serviceComboRepository;
    private final LoyaltyService loyaltyService;

    public CustomerLoyaltyService(
            CurrentUserService currentUserService,
            WashSessionRepository washSessionRepository,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository,
            LoyaltyService loyaltyService
    ) {
        this.currentUserService = currentUserService;
        this.washSessionRepository = washSessionRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
        this.loyaltyService = loyaltyService;
    }

    @Transactional(readOnly = true)
    public LoyaltyAccountResponse getAccount() {
        AuthUser user = currentUserService.getCurrentUser();
        List<WashSession> completedSessions = loadCompletedSessions(user);
        int totalEarnedPoints = completedSessions.stream()
                .mapToInt(session -> session.getAwardedLoyaltyPoints() == null ? 0 : session.getAwardedLoyaltyPoints())
                .sum();
        LoyaltyAccountResponse account = loyaltyService.getAccount(user.getId());

        return new LoyaltyAccountResponse(
                user.getId().toString(),
                account.tier(),
                account.currentPoints(),
                totalEarnedPoints,
                completedSessions.size(),
                account.updatedAt()
        );
    }

    @Transactional(readOnly = true)
    public LoyaltyTransactionPage listTransactions(int page, int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        Page<WashSession> sessions = washSessionRepository.findByBookingCustomerAndStatusOrderByCompletedAtDesc(
                user,
                WashSessionStatus.COMPLETED,
                PageRequest.of(Math.max(page - 1, 0), limit)
        );

        List<LoyaltyTransactionResponse> items = sessions.getContent().stream()
                .map(this::toTransaction)
                .toList();

        return new LoyaltyTransactionPage(items, toPagination(sessions));
    }

    @Transactional(readOnly = true)
    public WashHistoryPage listWashHistory(int page, int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        Page<WashSession> sessions = washSessionRepository.findByBookingCustomerAndStatusOrderByCompletedAtDesc(
                user,
                WashSessionStatus.COMPLETED,
                PageRequest.of(Math.max(page - 1, 0), limit)
        );

        List<WashHistoryItemResponse> items = sessions.getContent().stream()
                .map(this::toWashHistoryItem)
                .toList();

        return new WashHistoryPage(items, toPagination(sessions));
    }

    @Transactional(readOnly = true)
    public int getCurrentBalance(AuthUser user) {
        return loadCompletedSessions(user).stream()
                .mapToInt(session -> session.getAwardedLoyaltyPoints() == null ? 0 : session.getAwardedLoyaltyPoints())
                .sum();
    }

    private List<WashSession> loadCompletedSessions(AuthUser user) {
        return washSessionRepository.findByBookingCustomerAndStatusOrderByCompletedAtDesc(user, WashSessionStatus.COMPLETED);
    }

    private LoyaltyTransactionResponse toTransaction(WashSession session) {
        CustomerBooking booking = session.getBooking();
        int points = session.getAwardedLoyaltyPoints() == null ? 0 : session.getAwardedLoyaltyPoints();
        return new LoyaltyTransactionResponse(
                "LOYALTY_" + session.getId(),
                session.getId().toString(),
                booking.getId(),
                "EARN",
                points,
                "Points earned from completed wash " + booking.getId(),
                session.getCompletedAt()
        );
    }

    private WashHistoryItemResponse toWashHistoryItem(WashSession session) {
        CustomerBooking booking = session.getBooking();
        return new WashHistoryItemResponse(
                session.getId().toString(),
                booking.getId(),
                booking.getVehicle().getPlate(),
                resolvePackageName(booking),
                booking.getBookingDate(),
                booking.getBookingTime().toString(),
                booking.getFinalAmount(),
                session.getAwardedLoyaltyPoints() == null ? 0 : session.getAwardedLoyaltyPoints(),
                session.getStatus().name(),
                session.getCompletedAt()
        );
    }

    private String resolvePackageName(CustomerBooking booking) {
        if (booking.getPackageId() != null) {
            return servicePackageRepository.findById(booking.getPackageId())
                    .map(ServicePackage::getName)
                    .orElse(booking.getPackageId());
        }
        if (booking.getComboId() != null) {
            return serviceComboRepository.findById(booking.getComboId())
                    .map(ServiceCombo::getName)
                    .orElse(booking.getComboId());
        }
        return null;
    }

    private PaginationMeta toPagination(Page<?> page) {
        return new PaginationMeta(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
        );
    }

    public record LoyaltyTransactionPage(List<LoyaltyTransactionResponse> items, PaginationMeta pagination) {
    }

    public record WashHistoryPage(List<WashHistoryItemResponse> items, PaginationMeta pagination) {
    }
}
