package com.autowash.service;





import com.autowash.entity.*;
import com.autowash.repository.ServiceComboRepository;
import com.autowash.repository.ServicePackageRepository;
import com.autowash.dto.LoyaltyAccountResponse;
import com.autowash.dto.LoyaltyTransactionResponse;
import com.autowash.dto.PointTransactionResponse;
import com.autowash.dto.WashHistoryItemResponse;

import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.service.CurrentUserService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
        LoyaltyAccountResponse account = loyaltyService.getAccount(user.getId());

        return new LoyaltyAccountResponse(
                user.getId().toString(),
                account.tier(),
                account.currentPoints(),
                account.totalEarnedPoints(),
                account.completedWashCount(),
                account.updatedAt()
        );
    }

    @Transactional(readOnly = true)
    public LoyaltyTransactionPage listTransactions(int page, int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        LoyaltyService.TransactionPage transactionPage = loyaltyService.getTransactionHistory(
                user.getId(),
                null,
                null,
                null,
                page,
                limit
        );

        List<LoyaltyTransactionResponse> items = transactionPage.items().stream()
                .map(this::toTransaction)
                .toList();

        return new LoyaltyTransactionPage(items, transactionPage.pagination());
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
        return loyaltyService.getAccount(user.getId()).currentPoints();
    }

    private List<WashSession> loadCompletedSessions(AuthUser user) {
        return washSessionRepository.findByBookingCustomerAndStatusOrderByCompletedAtDesc(user, WashSessionStatus.COMPLETED);
    }

    private LoyaltyTransactionResponse toTransaction(PointTransactionResponse transaction) {
        Optional<WashSession> session = findReferencedSession(transaction.referenceId());
        String sessionId = session.map(value -> value.getId().toString()).orElse(null);
        String bookingId = session.map(value -> value.getBooking().getId()).orElse(transaction.referenceId());
        return new LoyaltyTransactionResponse(
                transaction.transactionId().toString(),
                sessionId,
                bookingId,
                transaction.type(),
                transaction.points(),
                transaction.reason(),
                transaction.createdAt()
        );
    }

    private Optional<WashSession> findReferencedSession(String referenceId) {
        if (referenceId == null || referenceId.isBlank()) {
            return Optional.empty();
        }
        try {
            return washSessionRepository.findWithBookingById(UUID.fromString(referenceId));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
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
