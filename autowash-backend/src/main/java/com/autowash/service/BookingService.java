package com.autowash.service;

import com.autowash.entity.User;
import com.autowash.dto.AddonSelectionResponse;
import com.autowash.dto.ApplyPointsRequest;
import com.autowash.dto.ApplyPointsResponse;
import com.autowash.dto.BookingDetailResponse;
import com.autowash.dto.BookingListItemResponse;
import com.autowash.dto.CancelBookingResponse;
import com.autowash.dto.CreateBookingRequest;
import com.autowash.dto.CreateBookingResponse;
import com.autowash.entity.CustomerCombo;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.entity.Booking;
import com.autowash.repository.BookingRepository;
import com.autowash.entity.Combo;
import com.autowash.entity.Package;
import com.autowash.entity.Voucher;
import com.autowash.repository.ComboRepository;
import com.autowash.repository.PackageRepository;
import com.autowash.service.CatalogService;
import com.autowash.dto.RedeemPointsResponse;
import com.autowash.service.LoyaltyRules;
import com.autowash.service.LoyaltyService;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import com.autowash.repository.WashSessionRepository;
import com.autowash.service.StaffAssignmentService;
import com.autowash.entity.Vehicle;
import com.autowash.entity.enums.VehicleStatus;
import com.autowash.repository.VehicleRepository;
import java.time.LocalDateTime;
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

@org.springframework.stereotype.Service
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
    private final VehicleRepository VehicleRepository;
    private final BookingRepository BookingRepository;
    private final CatalogService catalogService;
    private final PackageRepository PackageRepository;
    private final ComboRepository ComboRepository;
    private final WashSessionRepository washSessionRepository;
    private final LoyaltyService loyaltyService;
    private final StaffAssignmentService staffAssignmentService;
    private final CustomerComboService customerComboService;

    public BookingService(
            CurrentUserService currentUserService,
            VehicleRepository VehicleRepository,
            BookingRepository BookingRepository,
            CatalogService catalogService,
            PackageRepository PackageRepository,
            ComboRepository ComboRepository,
            WashSessionRepository washSessionRepository,
            LoyaltyService loyaltyService,
            StaffAssignmentService staffAssignmentService,
            CustomerComboService customerComboService
    ) {
        this.currentUserService = currentUserService;
        this.VehicleRepository = VehicleRepository;
        this.BookingRepository = BookingRepository;
        this.catalogService = catalogService;
        this.PackageRepository = PackageRepository;
        this.ComboRepository = ComboRepository;
        this.washSessionRepository = washSessionRepository;
        this.loyaltyService = loyaltyService;
        this.staffAssignmentService = staffAssignmentService;
        this.customerComboService = customerComboService;
    }

    @Transactional
    public CreateBookingResponse createBooking(CreateBookingRequest request, Object metadata) {
        User user = currentUserService.getCurrentUser();
        if (BookingRepository.countByCustomerAndStatusIn(user, ACTIVE_BOOKING_STATUSES) >= 3) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Maximum active bookings exceeded", "MAX_ACTIVE_BOOKINGS_EXCEEDED");
        }

        Vehicle vehicle = VehicleRepository.findByOwnerAndIdAndStatus(
                        user,
                        UUID.fromString(request.vehicleId()),
                        VehicleStatus.ACTIVE
                )
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Vehicle not found or not owned", "RESOURCE_NOT_FOUND"));

        List<com.autowash.entity.Service> addons = catalogService.requireActiveAddons(request.addons());
        Package Package = null;
        Combo Combo = null;
        CustomerCombo ownedCombo = null;
        long basePrice;
        int baseDuration;
        String responsePackageId = null;
        String responsePackageName;
        String customerComboId = null;
        boolean comboPurchased = false;

        if (request.packageId() != null && !request.packageId().isBlank()) {
            Package = catalogService.requireActivePackage(request.packageId());
            basePrice = Package.getBasePrice();
            baseDuration = Package.getDurationMinutes();
            responsePackageId = Package.getId().toString();
            responsePackageName = Package.getName();
        } else {
            Combo = catalogService.requireActiveCombo(request.comboId());
            ownedCombo = customerComboService.findActiveOwnedCombo(user, Combo.getId());
            baseDuration = 0;
            responsePackageName = Combo.getName();
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
                basePrice = Combo.getBasePrice();
                comboPurchased = true;
            }
        }

        long addonsTotal = addons.stream().mapToLong(com.autowash.entity.Service::getPrice).sum();
        long subtotal = basePrice + addonsTotal;
        Voucher voucher = null;
        long voucherDiscount = 0;
        if (request.voucherCode() != null && !request.voucherCode().isBlank()) {
            voucher = catalogService.validateVoucherForBooking(request.voucherCode(), basePrice);
            voucherDiscount = catalogService.calculateDiscountAmount(voucher, basePrice);
        }

        LocalDateTime scheduledAt = request.bookingDate().atTime(LocalTime.parse(request.bookingTime()));
        Booking booking = new Booking(
                generateBookingId(),
                user,
                vehicle,
                Package == null ? null : Package.getId(),
                Combo == null ? null : Combo.getId(),
                voucher == null ? null : voucher.getCode(),
                scheduledAt.toInstant(java.time.ZoneOffset.UTC),
                LocalTime.parse(request.bookingTime()),
                request.paymentMethod(),
                basePrice,
                addonsTotal,
                voucherDiscount,
                subtotal - voucherDiscount,
                baseDuration + addons.stream().mapToInt(com.autowash.entity.Service::getDurationMinutes).sum()
        );
        BookingRepository.save(booking);

        if (Combo != null) {
            if (ownedCombo == null) {
                ownedCombo = customerComboService.createOwnedCombo(user, Combo.getId(), booking.getId());
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
                0,
                null,
                booking.getCreatedAt(),
                booking.getId(),
                Combo == null ? null : Combo.getId(),
                customerComboId,
                comboPurchased,
                null
        );
    }

    @Transactional(readOnly = true)
    public BookingPage listBookings(String status, LocalDate dateFrom, LocalDate dateTo, int page, int limit) {
        User user = currentUserService.getCurrentUser();
        Page<Booking> bookings;
        if (status != null && !status.isBlank()) {
            bookings = BookingRepository.findByCustomerAndStatusOrderByCreatedAtDesc(
                    user,
                    BookingStatus.valueOf(status),
                    PageRequest.of(Math.max(page - 1, 0), limit)
            );
        } else {
            bookings = BookingRepository.findByCustomerOrderByCreatedAtDesc(
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
        Booking booking = findOwnedBooking(bookingId);
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
    public ApplyPointsResponse applyPoints(String bookingId, ApplyPointsRequest request) {
        User user = currentUserService.getCurrentUser();
        Booking booking = findOwnedBooking(bookingId);
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
    public Booking requireBookingForOperations(String bookingId) {
        return BookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
    }

    @Transactional
    public void updateStatus(Booking booking, BookingStatus status) {
        booking.updateStatus(status);
    }

    private Booking findOwnedBooking(String bookingId) {
        User user = currentUserService.getCurrentUser();
        return BookingRepository.findByCustomerAndId(user, bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
    }

    private BookingListItemResponse toListItem(Booking booking) {
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

    public BookingDetailResponse toDetailResponse(Booking booking) {
        String packageName = resolvePackageName(booking);
        var washSession = washSessionRepository.findFirstByBookingIdOrderByCompletedAtDesc(booking.getId())
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
                null
        );
    }

    private String resolveAssignedStaffName(Booking booking, com.autowash.entity.WashSession washSession) {
        if (washSession != null && washSession.getAssignedStaff() != null) {
            return washSession.getAssignedStaff().getFullName();
        }
        return booking.getAssignedStaff() == null ? null : booking.getAssignedStaff().getFullName();
    }

    private String resolvePackageName(Booking booking) {
        if (booking.getPackageId() != null) {
            return PackageRepository.findById(booking.getPackageId())
                    .map(Package::getName)
                    .orElse(booking.getPackageId().toString());
        }
        if (booking.getComboId() != null) {
            return ComboRepository.findById(booking.getComboId())
                    .map(Combo::getName)
                    .orElse(booking.getComboId().toString());
        }
        return null;
    }

    private List<AddonSelectionResponse> toAddonSelections(List<com.autowash.entity.Service> addons) {
        return addons.stream()
                .map(addon -> new AddonSelectionResponse(addon.getId().toString(), addon.getName(), addon.getPrice()))
                .toList();
    }

    private String generateBookingId() {
        return "BK_" + System.currentTimeMillis();
    }

    public record BookingPage(List<BookingListItemResponse> items, PaginationMeta pagination) {
    }
}


