package com.autowash.operation.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.catalog.entity.ServiceCombo;
import com.autowash.catalog.entity.ServicePackage;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.catalog.repository.ServicePackageRepository;
import com.autowash.operation.dto.CustomerWashTrackingResponse;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.shared.exception.ApiException;
import com.autowash.user.service.CurrentUserService;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerWashTrackingService {

    private static final Set<WashSessionStatus> ACTIVE_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.QUEUED,
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS
    );

    private final CurrentUserService currentUserService;
    private final WashSessionRepository washSessionRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceComboRepository serviceComboRepository;

    public CustomerWashTrackingService(
            CurrentUserService currentUserService,
            WashSessionRepository washSessionRepository,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository
    ) {
        this.currentUserService = currentUserService;
        this.washSessionRepository = washSessionRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
    }

    @Transactional(readOnly = true)
    public CustomerWashTrackingResponse getActiveSession() {
        AuthUser customer = currentUserService.getCurrentUser();
        return washSessionRepository.findFirstByBookingCustomerAndStatusInOrderByCreatedAtDesc(customer, ACTIVE_STATUSES)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public CustomerWashTrackingResponse getSession(UUID washSessionId) {
        AuthUser customer = currentUserService.getCurrentUser();
        WashSession session = washSessionRepository.findByIdAndBookingCustomer(washSessionId, customer)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND"));
        return toResponse(session);
    }

    private CustomerWashTrackingResponse toResponse(WashSession session) {
        CustomerBooking booking = session.getBooking();
        return new CustomerWashTrackingResponse(
                session.getId().toString(),
                booking.getId(),
                session.getStatus().name(),
                booking.getCustomer().getFullName(),
                booking.getCustomer().getPhone(),
                booking.getVehicle().getPlate(),
                booking.getVehicle().getBrand(),
                booking.getVehicle().getModel(),
                booking.getPackageId(),
                resolveServiceName(booking),
                booking.getBookingDate(),
                booking.getBookingTime().toString(),
                session.getAssignedStaff() == null ? null : session.getAssignedStaff().getFullName(),
                session.getFeeAmount(),
                session.getFeeCurrency(),
                session.getProjectedLoyaltyPoints(),
                session.getAwardedLoyaltyPoints(),
                session.getNotes(),
                session.getCreatedAt(),
                session.getQueuedAt(),
                session.getCheckedInAt(),
                session.getStartedAt(),
                session.getCompletedAt()
        );
    }

    private String resolveServiceName(CustomerBooking booking) {
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
}
