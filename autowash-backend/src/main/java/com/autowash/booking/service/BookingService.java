package com.autowash.booking.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.booking.dto.AddonSelectionResponse;
import com.autowash.booking.dto.BookingDetailResponse;
import com.autowash.booking.dto.BookingListItemResponse;
import com.autowash.booking.dto.CancelBookingResponse;
import com.autowash.booking.dto.CreateBookingRequest;
import com.autowash.booking.dto.CreateBookingResponse;
import com.autowash.booking.entity.BookingAddon;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.catalog.entity.ServiceAddon;
import com.autowash.catalog.entity.ServiceCombo;
import com.autowash.catalog.entity.ServicePackage;
import com.autowash.catalog.entity.Voucher;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.catalog.repository.ServicePackageRepository;
import com.autowash.catalog.service.CatalogService;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.user.service.CurrentUserService;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleStatus;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
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
            BookingStatus.SESSION_CREATED,
            BookingStatus.CHECKED_IN,
            BookingStatus.IN_PROGRESS
    );

    private final CurrentUserService currentUserService;
    private final CustomerVehicleRepository customerVehicleRepository;
    private final CustomerBookingRepository customerBookingRepository;
    private final CatalogService catalogService;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceComboRepository serviceComboRepository;

    public BookingService(
            CurrentUserService currentUserService,
            CustomerVehicleRepository customerVehicleRepository,
            CustomerBookingRepository customerBookingRepository,
            CatalogService catalogService,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository
    ) {
        this.currentUserService = currentUserService;
        this.customerVehicleRepository = customerVehicleRepository;
        this.customerBookingRepository = customerBookingRepository;
        this.catalogService = catalogService;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
    }

    @Transactional
    public CreateBookingResponse createBooking(CreateBookingRequest request) {
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
        long basePrice;
        int baseDuration;
        String responsePackageId = null;
        String responsePackageName;

        if (request.packageId() != null && !request.packageId().isBlank()) {
            servicePackage = catalogService.requireActivePackage(request.packageId());
            basePrice = servicePackage.getBasePrice();
            baseDuration = servicePackage.getDurationMinutes();
            responsePackageId = servicePackage.getId();
            responsePackageName = servicePackage.getName();
        } else {
            serviceCombo = catalogService.requireActiveCombo(request.comboId());
            basePrice = serviceCombo.getBasePrice();
            baseDuration = 0;
            responsePackageName = serviceCombo.getName();
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
        addons.forEach(addon -> booking.addAddon(new BookingAddon(booking, addon.getId(), addon.getName(), addon.getPrice())));
        customerBookingRepository.save(booking);

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
                booking.getCreatedAt(),
                booking.getId()
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
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
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
        return new BookingListItemResponse(
                booking.getId(),
                booking.getVehicle().getPlate(),
                packageName,
                booking.getBookingDate(),
                booking.getBookingTime().toString(),
                booking.getFinalAmount(),
                booking.getStatus().name(),
                null,
                booking.getCreatedAt(),
                null
        );
    }

    private BookingDetailResponse toDetailResponse(CustomerBooking booking) {
        String packageName = resolvePackageName(booking);
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
                null,
                null,
                null,
                null,
                booking.getCreatedAt()
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
