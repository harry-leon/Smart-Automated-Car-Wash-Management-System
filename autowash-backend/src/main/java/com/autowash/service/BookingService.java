package com.autowash.service;

import com.autowash.entity.*;
import com.autowash.entity.enums.PaymentMethod;


import com.autowash.dto.AddonSelectionResponse;
import com.autowash.dto.ApplyPointsRequest;
import com.autowash.dto.ApplyPointsResponse;
import com.autowash.dto.BookingDetailResponse;
import com.autowash.dto.BookingListItemResponse;
import com.autowash.dto.BookingOtpResponse;
import com.autowash.dto.CancelBookingResponse;
import com.autowash.dto.CreateBookingRequest;
import com.autowash.dto.CreateBookingResponse;


import com.autowash.entity.enums.BookingStatus;


import com.autowash.entity.enums.BookingOtpChallengeStatus;
import com.autowash.repository.BookingOtpChallengeRepository;
import com.autowash.repository.CustomerBookingRepository;




import com.autowash.repository.ServiceComboRepository;
import com.autowash.repository.ServicePackageRepository;
import com.autowash.service.CatalogService;
import com.autowash.dto.RedeemPointsResponse;
import com.autowash.service.LoyaltyRules;
import com.autowash.service.LoyaltyService;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import com.autowash.repository.WashSessionRepository;
import com.autowash.service.StaffAssignmentService;

import com.autowash.entity.enums.VehicleStatus;
import com.autowash.repository.CustomerVehicleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private static final Set<BookingStatus> ACTIVE_BOOKING_STATUSES = Set.of(
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.IN_PROGRESS
    );
    private static final Set<BookingStatus> CANCELLABLE_BOOKING_STATUSES = Set.of(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED
    );

    private final CurrentUserService currentUserService;
    private final CustomerVehicleRepository customerVehicleRepository;
    private final CustomerBookingRepository customerBookingRepository;
    private final CatalogService catalogService;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceComboRepository serviceComboRepository;
    private final WashSessionRepository washSessionRepository;
    private final LoyaltyService loyaltyService;
    private final StaffAssignmentService staffAssignmentService;
    private final BookingOtpService bookingOtpService;
    private final CustomerComboService customerComboService;
    private final BookingOtpChallengeRepository challengeRepository;

    public BookingService(
            CurrentUserService currentUserService,
            CustomerVehicleRepository customerVehicleRepository,
            CustomerBookingRepository customerBookingRepository,
            CatalogService catalogService,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository,
            WashSessionRepository washSessionRepository,
            LoyaltyService loyaltyService,
            StaffAssignmentService staffAssignmentService,
            BookingOtpService bookingOtpService,
            CustomerComboService customerComboService,
            BookingOtpChallengeRepository challengeRepository
    ) {
        this.currentUserService = currentUserService;
        this.customerVehicleRepository = customerVehicleRepository;
        this.customerBookingRepository = customerBookingRepository;
        this.catalogService = catalogService;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
        this.washSessionRepository = washSessionRepository;
        this.loyaltyService = loyaltyService;
        this.staffAssignmentService = staffAssignmentService;
        this.bookingOtpService = bookingOtpService;
        this.customerComboService = customerComboService;
        this.challengeRepository = challengeRepository;
    }

    @Transactional
    public CreateBookingResponse createBooking(CreateBookingRequest request, BookingOtpService.RequestMetadata metadata) {
        AuthUser user = currentUserService.getCurrentUser();
        if (customerBookingRepository.countByCustomerAndStatusIn(user, ACTIVE_BOOKING_STATUSES) >= 3) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Maximum active bookings exceeded", "MAX_ACTIVE_BOOKINGS_EXCEEDED");
        }

        CustomerVehicle vehicle = customerVehicleRepository.findByOwnerAndIdAndStatus(
                        user,
                        UUID.fromString(request.vehicleId()),
                        VehicleStatus.ACTIVE
                )
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Vehicle not found or not owned", "RESOURCE_NOT_FOUND"));

        List<ServiceAddon> addons = catalogService.requireActiveAddons(request.addons());
        ServicePackage servicePackage = null;

        ServiceCombo serviceCombo = null;
        CustomerCombo ownedCombo = null;
        long basePrice;
        int baseDuration;
        String responsePackageId = null;
        String responsePackageName;
        String customerComboId = null;
        boolean comboPurchased = false;

        if (request.packageId() != null && !request.packageId().isBlank()) {
            servicePackage = catalogService.requireActivePackage(request.packageId());

            basePrice = servicePackage.getBasePrice();
            baseDuration = servicePackage.getDurationMinutes();
            responsePackageId = servicePackage.getId();
            responsePackageName = servicePackage.getName();
        } else {
            serviceCombo = catalogService.requireActiveCombo(request.comboId());
            ownedCombo = customerComboService.findActiveOwnedCombo(user, serviceCombo.getId());
            baseDuration = 0;
            responsePackageName = serviceCombo.getName();
            if (ownedCombo != null) {
                if (ownedCombo.isExpired()) {
                    customerComboService.markExpired(ownedCombo);
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo is expired", "BUSINESS_RULE_VIOLATION");
                }
                if (!ownedCombo.hasRemainingUsages()) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Combo has no remaining usages", "BUSINESS_RULE_VIOLATION");
                }
                basePrice = 0;
                customerComboId = ownedCombo.getId();
            } else {
                basePrice = serviceCombo.getBasePrice();
                comboPurchased = true;
            }
        }

        long addonsTotal = addons.stream().mapToLong(ServiceAddon::getPrice).sum();
        long subtotal = basePrice + addonsTotal;
        Voucher voucher = null;
        long voucherDiscount = 0;
        if (request.voucherCode() != null && !request.voucherCode().isBlank()) {
            voucher = catalogService.validateVoucherForBooking(request.voucherCode(), basePrice);
            voucherDiscount = catalogService.calculateDiscountAmount(voucher, basePrice);
        }

        CustomerBooking booking = new CustomerBooking(
                generateBookingId(),
                user,
                vehicle,
                servicePackage == null ? null : servicePackage.getId(),
                serviceCombo == null ? null : serviceCombo.getId(),
                voucher == null ? null : voucher.getCode(),
                request.bookingDate(),
                LocalTime.parse(request.bookingTime()),
                request.paymentMethod(),
                basePrice,
                addonsTotal,
                voucherDiscount,
                subtotal - voucherDiscount,
                baseDuration + addons.stream().mapToInt(ServiceAddon::getDurationMinutes).sum()
        );

        booking.assignStaff(staffAssignmentService.pickLeastLoadedActiveStaff());
        addons.forEach(addon -> booking.addAddon(new BookingAddon(booking, addon.getId(), addon.getName(), addon.getPrice())));
        customerBookingRepository.save(booking);
        var otpResponse = bookingOtpService.issueInitialOtp(booking, metadata);

        if (serviceCombo != null) {
            if (ownedCombo == null) {
                ownedCombo = customerComboService.createOwnedCombo(user, serviceCombo.getId(), booking.getId());
                customerComboId = ownedCombo.getId();
            }
            customerComboService.recordUsage(ownedCombo, booking.getId(), request.bookingDate());
        }

        return new CreateBookingResponse(
                booking.getId(),
                user.getId().toString(),
                vehicle.getId().toString(),
                vehicle.getPlate(),
                responsePackageId,
                responsePackageName,
                toAddonSelections(booking.getAddons()),
                booking.getBasePrice(),
                booking.getAddonsTotal(),
                booking.getVoucherDiscount(),
                booking.getFinalAmount(),
                booking.getBookingDate(),
                booking.getBookingTime().toString(),
                booking.getEstimatedDurationMinutes(),
                booking.getPaymentMethod().name(),
                booking.getPaymentStatus().name(),
                booking.getStatus().name(),
                booking.getConfirmationStatus().name(),
                otpResponse.otpExpiresIn(),
                otpResponse.expiresAt(),
                booking.getCreatedAt(),
                booking.getId(),
                serviceCombo == null ? null : serviceCombo.getId(),
                customerComboId,
                comboPurchased,
                otpResponse.devOtp()
        );
    }

    @Transactional(readOnly = true)
    public BookingPage listBookings(String status, LocalDate dateFrom, LocalDate dateTo, int page, int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        Page<CustomerBooking> bookings;
        if (status != null && !status.isBlank()) {
            bookings = customerBookingRepository.findByCustomerAndStatusOrderByCreatedAtDesc(
                    user,
                    BookingStatus.valueOf(status),
                    PageRequest.of(Math.max(page - 1, 0), limit)
            );
        } else if (dateFrom != null && dateTo != null) {
            bookings = customerBookingRepository.findByCustomerAndBookingDateBetweenOrderByCreatedAtDesc(
                    user,
                    dateFrom,
                    dateTo,
                    PageRequest.of(Math.max(page - 1, 0), limit)
            );
        } else {
            bookings = customerBookingRepository.findByCustomerOrderByCreatedAtDesc(
                    user,
                    PageRequest.of(Math.max(page - 1, 0), limit)
            );
        }

        List<BookingListItemResponse> items = bookings.getContent().stream().map(this::toListItem).toList();
        PaginationMeta pagination = new PaginationMeta(
                bookings.getNumber() + 1,
                bookings.getSize(),
                bookings.getTotalElements(),
                bookings.getTotalPages(),
                bookings.hasNext()
        );
        return new BookingPage(items, pagination);
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getBooking(String bookingId) {
        return toDetailResponse(findOwnedBooking(bookingId));
    }

    @Transactional
    public CancelBookingResponse cancelBooking(String bookingId, String reason) {
        CustomerBooking booking = findOwnedBooking(bookingId);
        if (!CANCELLABLE_BOOKING_STATUSES.contains(booking.getStatus())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Booking cannot be cancelled", "RESOURCE_LOCKED");
        }
        booking.cancel(reason);
        return new CancelBookingResponse(
                booking.getId(),
                booking.getStatus().name(),
                booking.getCancelledAt(),
                booking.getRefundAmount(),
                booking.getRefundStatus(),
                "Refund will be processed within 3-5 business days"
        );
    }

    @Transactional
    public BookingOtpResponse resendBookingOtp(String bookingId, BookingOtpService.RequestMetadata metadata) {
        return bookingOtpService.resendOtp(findOwnedBooking(bookingId), metadata);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public BookingOtpResponse verifyBookingOtp(String bookingId, String otp, BookingOtpService.RequestMetadata metadata) {
        return bookingOtpService.verifyOtp(findOwnedBooking(bookingId), otp, metadata);
    }

    @Transactional
    public ApplyPointsResponse applyPoints(String bookingId, ApplyPointsRequest request) {
        AuthUser user = currentUserService.getCurrentUser();
        CustomerBooking booking = findOwnedBooking(bookingId);
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Points can only be applied before check-in",
                    "BUSINESS_RULE_VIOLATION"
            );
        }
        if (booking.getPointsRedeemed() > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Points already applied to this booking", "POINTS_ALREADY_APPLIED");
        }

        int pointsToApply = request.pointsToApply();
        long discountAmount = (long) pointsToApply * LoyaltyRules.VND_PER_POINT;
        if (discountAmount > booking.getFinalAmount()) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Points discount exceeds booking amount",
                    "BUSINESS_RULE_VIOLATION"
            );
        }

        RedeemPointsResponse redemption = loyaltyService.redeemPoints(user.getId(), pointsToApply, booking.getId());
        booking.applyPoints(pointsToApply, discountAmount);
        return new ApplyPointsResponse(
                booking.getId(),
                pointsToApply,
                discountAmount,
                booking.getFinalAmount(),
                redemption.newBalance(),
                "VND"
        );
    }

    @Transactional(readOnly = true)
    public CustomerBooking requireBookingForOperations(String bookingId) {
        return customerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
    }

    @Transactional
    public void updateStatus(CustomerBooking booking, BookingStatus status) {
        booking.updateStatus(status);
    }

    private CustomerBooking findOwnedBooking(String bookingId) {
        AuthUser user = currentUserService.getCurrentUser();
        return customerBookingRepository.findByCustomerAndId(user, bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
    }

    private BookingListItemResponse toListItem(CustomerBooking booking) {
        String packageName = resolvePackageName(booking);
        var washSession = washSessionRepository.findFirstByBookingIdOrderByCompletedAtDesc(booking.getId())
                .orElse(null);
        String washStatus = washSession == null ? null : washSession.getStatus().name();
        return new BookingListItemResponse(
                booking.getId(),
                booking.getVehicle().getPlate(),
                packageName,
                booking.getBookingDate(),
                booking.getBookingTime().toString(),
                booking.getFinalAmount(),
                booking.getStatus().name(),
                washStatus,
                booking.getCreatedAt(),
                washSession == null ? null : washSession.getCompletedAt()
        );
    }

    public BookingDetailResponse toDetailResponse(CustomerBooking booking) {
        String packageName = resolvePackageName(booking);
        var washSession = washSessionRepository.findFirstByBookingIdOrderByCompletedAtDesc(booking.getId())
                .orElse(null);
        String devOtp = challengeRepository.findFirstByBookingAndStatusOrderBySentAtDesc(booking, BookingOtpChallengeStatus.PENDING)
                .map(BookingOtpChallenge::getDevOtp)
                .orElse(null);
        return new BookingDetailResponse(
                booking.getId(),
                booking.getId(),
                booking.getCustomer().getId().toString(),
                booking.getCustomer().getFullName(),
                booking.getCustomer().getPhone(),
                booking.getVehicle().getId().toString(),
                booking.getVehicle().getPlate(),
                booking.getVehicle().getBrand(),
                booking.getVehicle().getModel(),
                booking.getPackageId(),
                packageName,
                toAddonSelections(booking.getAddons()),
                new BookingDetailResponse.Pricing(
                        booking.getBasePrice(),
                        booking.getAddonsTotal(),
                        booking.getBasePrice() + booking.getAddonsTotal(),
                        booking.getVoucherCode(),
                        booking.getVoucherDiscount(),
                        booking.getPointsRedeemed(),
                        booking.getPointsDiscount(),
                        booking.getFinalAmount(),
                        "VND"
                ),
                new BookingDetailResponse.Scheduling(
                        booking.getBookingDate(),
                        booking.getBookingTime().toString(),
                        booking.getEstimatedDurationMinutes(),
                        booking.getBookingTime().plusMinutes(booking.getEstimatedDurationMinutes()).format(DateTimeFormatter.ofPattern("HH:mm"))
                ),
                new BookingDetailResponse.Payment(
                        booking.getPaymentMethod().name(),
                        booking.getPaymentStatus().name(),
                        "TXN_" + booking.getId(),
                        booking.getCreatedAt()
                ),
                booking.getStatus().name(),
                booking.getConfirmationStatus().name(),
                booking.getConfirmationExpiresAt(),
                washSession == null ? null : washSession.getId().toString(),
                resolveAssignedStaffName(booking, washSession),
                washSession == null ? null : washSession.getStatus().name(),
                washSession == null ? null : washSession.getNotes(),
                booking.getCreatedAt(),
                devOtp
        );
    }

    private String resolveAssignedStaffName(CustomerBooking booking, com.autowash.entity.WashSession washSession) {
        if (washSession != null && washSession.getAssignedStaff() != null) {
            return washSession.getAssignedStaff().getFullName();
        }
        return booking.getAssignedStaff() == null ? null : booking.getAssignedStaff().getFullName();
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

    private List<AddonSelectionResponse> toAddonSelections(List<BookingAddon> addons) {
        return addons.stream()
                .map(addon -> new AddonSelectionResponse(addon.getAddonId(), addon.getAddonName(), addon.getAddonPrice()))
                .toList();
    }

    private String generateBookingId() {
        return "BK_" + System.currentTimeMillis();
    }

    public record BookingPage(List<BookingListItemResponse> items, PaginationMeta pagination) {
    }
}
