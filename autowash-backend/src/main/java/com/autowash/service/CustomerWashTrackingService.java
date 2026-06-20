package com.autowash.service;

import com.autowash.entity.AuthUser;
import com.autowash.entity.CustomerBooking;
import com.autowash.entity.ServiceCombo;
import com.autowash.entity.ServicePackage;
import com.autowash.repository.ServiceComboRepository;
import com.autowash.repository.ServicePackageRepository;
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
public class CustomerWashTrackingService {

    private static final Set<WashSessionStatus> ACTIVE_STATUSES = Set.of(
            WashSessionStatus.PENDING,
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
        return CustomerWashTrackingResponse.builder()
                .washSessionId(session.getId().toString())
                .bookingId(booking.getId())
                .status(session.getStatus().name())
                .customerName(booking.getCustomer().getFullName())
                .customerPhone(booking.getCustomer().getPhone())
                .vehiclePlate(booking.getVehicle().getPlate())
                .vehicleBrand(booking.getVehicle().getBrand())
                .vehicleModel(booking.getVehicle().getModel())
                .packageId(booking.getPackageId())
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

