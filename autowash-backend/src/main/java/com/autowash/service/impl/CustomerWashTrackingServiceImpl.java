package com.autowash.service.impl;

import com.autowash.service.*;
import com.autowash.entity.User;
import com.autowash.entity.Booking;
import com.autowash.entity.Combo;
import com.autowash.entity.LoyaltyAccount;
import com.autowash.entity.Package;
import com.autowash.repository.ComboRepository;
import com.autowash.repository.LoyaltyAccountRepository;
import com.autowash.repository.PackageRepository;
import com.autowash.dto.CompletionSummaryResponse;
import com.autowash.dto.CustomerWashTrackingResponse;
import com.autowash.entity.WashSession;
import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.WashSessionRepository;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerWashTrackingServiceImpl implements CustomerWashTrackingService {

    private static final Set<WashSessionStatus> ACTIVE_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.QUEUED,
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS
    );

    private final CurrentUserService currentUserService;
    private final WashSessionRepository washSessionRepository;
    private final PackageRepository PackageRepository;
    private final ComboRepository ComboRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PromotionService promotionService;

    public CustomerWashTrackingServiceImpl(
            CurrentUserService currentUserService,
            WashSessionRepository washSessionRepository,
            PackageRepository PackageRepository,
            ComboRepository ComboRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            PromotionService promotionService
    ) {
        this.currentUserService = currentUserService;
        this.washSessionRepository = washSessionRepository;
        this.PackageRepository = PackageRepository;
        this.ComboRepository = ComboRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.promotionService = promotionService;
    }

    @Transactional(readOnly = true)
    public CustomerWashTrackingResponse getActiveSession() {
        User customer = currentUserService.getCurrentUser();
        return washSessionRepository.findFirstByBookingCustomerAndStatusInOrderByCreatedAtDesc(customer, ACTIVE_STATUSES)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public CustomerWashTrackingResponse getSession(UUID washSessionId) {
        User customer = currentUserService.getCurrentUser();
        WashSession session = washSessionRepository.findByIdAndBookingCustomer(washSessionId, customer)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND"));
        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public CompletionSummaryResponse getCompletionSummary(UUID washSessionId) {
        User customer = currentUserService.getCurrentUser();
        WashSession session = washSessionRepository.findByIdAndBookingCustomer(washSessionId, customer)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND"));
        if (session.getStatus() != WashSessionStatus.COMPLETED) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Wash session is not completed yet", "BUSINESS_RULE_VIOLATION");
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> new LoyaltyAccount(customer));

        return new CompletionSummaryResponse(
                session.getBooking().getId().toString(),
                session.getId().toString(),
                session.getStatus().name(),
                session.getAwardedLoyaltyPoints() == null ? 0 : session.getAwardedLoyaltyPoints(),
                account.getCurrentPoints(),
                account.getTier().name(),
                session.getCompletedAt(),
                promotionService.listActiveLegacyForCurrentCustomer()
        );
    }

    private CustomerWashTrackingResponse toResponse(WashSession session) {
        Booking booking = session.getBooking();
        return CustomerWashTrackingResponse.builder()
                .washSessionId(session.getId().toString())
                .bookingId(booking.getId().toString())
                .status(session.getStatus().name())
                .customerName(booking.getCustomer().getFullName())
                .customerPhone(booking.getCustomer().getPhone())
                .vehiclePlate(booking.getVehicle().getPlate())
                .vehicleBrand(booking.getVehicle().getBrand())
                .vehicleModel(booking.getVehicle().getModel())
                .packageId(booking.getPackageId() == null ? null : booking.getPackageId().toString())
                .serviceName(resolveServiceName(booking))
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime().toString())
                .assignedStaffName(session.getAssignedStaff() == null ? null : session.getAssignedStaff().getFullName())
                .feeAmount(session.getFeeAmount())
                .projectedLoyaltyPoints(session.getProjectedLoyaltyPoints())
                .awardedLoyaltyPoints(session.getAwardedLoyaltyPoints())
                .notes(session.getNotes())
                .createdAt(session.getCreatedAt())
                .checkedInAt(session.getCheckedInAt())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .build();
    }

    private String resolveServiceName(Booking booking) {
        if (booking.getPackageId() != null) {
            return PackageRepository.findById(booking.getPackageId())
                    .map(Package::getName)
                    .orElse(booking.getPackageId() == null ? null : booking.getPackageId().toString());
        }
        if (booking.getComboId() != null) {
            return ComboRepository.findById(booking.getComboId())
                    .map(Combo::getName)
                    .orElse(booking.getComboId() == null ? null : booking.getComboId().toString());
        }
        return null;
    }
}

