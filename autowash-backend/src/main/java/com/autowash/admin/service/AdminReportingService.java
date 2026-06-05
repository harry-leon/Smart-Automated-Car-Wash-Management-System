package com.autowash.admin.service;

import com.autowash.admin.dto.AdminBookingResponse;
import com.autowash.admin.dto.AdminAccountResponse;
import com.autowash.admin.dto.AdminCustomerDetailResponse;
import com.autowash.admin.dto.AdminCustomerVehicleResponse;
import com.autowash.admin.dto.AdminTierHistoryResponse;
import com.autowash.admin.dto.AdminWashHistoryResponse;
import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.entity.UserStatus;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.catalog.repository.ServicePackageRepository;
import com.autowash.loyalty.dto.LoyaltyAccountResponse;
import com.autowash.loyalty.dto.PointTransactionResponse;
import com.autowash.loyalty.entity.PointTransactionType;
import com.autowash.loyalty.entity.PointTransaction;
import com.autowash.loyalty.repository.PointTransactionRepository;
import com.autowash.loyalty.service.LoyaltyService;
import com.autowash.operation.dto.BookingStaffTransferAuditResponse;
import com.autowash.operation.entity.BookingStaffTransferAudit;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.BookingStaffTransferAuditRepository;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleStatus;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminReportingService {

    private final CustomerBookingRepository bookingRepository;
    private final WashSessionRepository washSessionRepository;
    private final AuthUserRepository authUserRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceComboRepository serviceComboRepository;
    private final LoyaltyService loyaltyService;
    private final PointTransactionRepository pointTransactionRepository;
    private final CustomerVehicleRepository customerVehicleRepository;
    private final BookingStaffTransferAuditRepository transferAuditRepository;

    public AdminReportingService(
            CustomerBookingRepository bookingRepository,
            WashSessionRepository washSessionRepository,
            AuthUserRepository authUserRepository,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository,
            LoyaltyService loyaltyService,
            PointTransactionRepository pointTransactionRepository,
            CustomerVehicleRepository customerVehicleRepository,
            BookingStaffTransferAuditRepository transferAuditRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.washSessionRepository = washSessionRepository;
        this.authUserRepository = authUserRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
        this.loyaltyService = loyaltyService;
        this.pointTransactionRepository = pointTransactionRepository;
        this.customerVehicleRepository = customerVehicleRepository;
        this.transferAuditRepository = transferAuditRepository;
    }

    @Transactional(readOnly = true)
    public AccountPage listAccounts(String role, String status, String searchQuery, int page, int limit) {
        UserRole parsedRole = parseRole(role);
        UserStatus parsedStatus = parseUserStatus(status);
        String normalizedSearch = normalizeSearch(searchQuery);
        String searchLike = normalizedSearch == null ? null : "%" + normalizedSearch.toLowerCase() + "%";

        Page<AuthUser> accounts = authUserRepository.searchAccounts(
                parsedRole,
                parsedStatus,
                searchLike,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );

        List<AdminAccountResponse> items = accounts.getContent().stream()
                .map(this::toAccountResponse)
                .toList();
        return new AccountPage(items, pagination(accounts));
    }

    @Transactional(readOnly = true)
    public BookingPage listBookings(
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            UUID customerId,
            String searchQuery,
            int page,
            int limit
    ) {
        validateDateRange(dateFrom, dateTo);
        List<BookingStatus> statuses = parseStatuses(status);
        String normalizedSearch = normalizeSearch(searchQuery);
        String searchLike = normalizedSearch == null ? null : "%" + normalizedSearch.toLowerCase() + "%";
        Page<CustomerBooking> bookings = bookingRepository.searchAdmin(
                statuses,
                !statuses.isEmpty(),
                customerId,
                dateFrom,
                dateTo,
                searchLike,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );

        Map<String, WashSession> sessionsByBookingId = sessionsByBookingId(bookings.getContent());
        Map<String, String> serviceNames = serviceNames(bookings.getContent());
        List<AdminBookingResponse> items = bookings.getContent().stream()
                .map(booking -> toBookingResponse(booking, sessionsByBookingId.get(booking.getId()), serviceNames))
                .toList();
        return new BookingPage(items, pagination(bookings));
    }

    @Transactional(readOnly = true)
    public TransferAuditPage listTransferAudits(int page, int limit) {
        Page<BookingStaffTransferAudit> audits = transferAuditRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(Math.max(page - 1, 0), limit)
        );
        return new TransferAuditPage(
                audits.getContent().stream().map(this::toTransferAuditResponse).toList(),
                pagination(audits)
        );
    }

    @Transactional(readOnly = true)
    public com.autowash.booking.dto.BookingDetailResponse getBookingDetail(String bookingId) {
        CustomerBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
        
        String packageName = null;
        if (booking.getPackageId() != null) {
            packageName = servicePackageRepository.findById(booking.getPackageId())
                    .map(com.autowash.catalog.entity.ServicePackage::getName)
                    .orElse(booking.getPackageId());
        } else if (booking.getComboId() != null) {
            packageName = serviceComboRepository.findById(booking.getComboId())
                    .map(com.autowash.catalog.entity.ServiceCombo::getName)
                    .orElse(booking.getComboId());
        }

        var washSession = washSessionRepository.findFirstByBookingIdOrderByCompletedAtDesc(booking.getId())
                .orElse(null);

        List<com.autowash.booking.dto.AddonSelectionResponse> addonSelections = booking.getAddons().stream()
                .map(addon -> new com.autowash.booking.dto.AddonSelectionResponse(addon.getAddonId(), addon.getAddonName(), addon.getAddonPrice()))
                .toList();

        return new com.autowash.booking.dto.BookingDetailResponse(
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
                addonSelections,
                new com.autowash.booking.dto.BookingDetailResponse.Pricing(
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
                new com.autowash.booking.dto.BookingDetailResponse.Scheduling(
                        booking.getBookingDate(),
                        booking.getBookingTime().toString(),
                        booking.getEstimatedDurationMinutes(),
                        booking.getBookingTime().plusMinutes(booking.getEstimatedDurationMinutes()).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                ),
                new com.autowash.booking.dto.BookingDetailResponse.Payment(
                        booking.getPaymentMethod().name(),
                        booking.getPaymentStatus().name(),
                        "TXN_" + booking.getId(),
                        booking.getCreatedAt()
                ),
                booking.getStatus().name(),
                washSession == null ? null : washSession.getId().toString(),
                null,
                washSession == null ? null : washSession.getStatus().name(),
                washSession == null ? null : washSession.getNotes(),
                booking.getCreatedAt()
        );
    }

    @Transactional
    public AdminCustomerDetailResponse getCustomerDetail(UUID customerId) {
        AuthUser customer = requireCustomer(customerId);
        LoyaltyAccountResponse loyalty = loyaltyService.getAccount(customerId);
        CustomerBooking lastBooking = bookingRepository.findFirstByCustomerOrderByCreatedAtDesc(customer).orElse(null);

        long totalPointsEarned = sumPoints(customer, PointTransactionType.EARN);
        long totalPointsSpent = Math.abs(sumPoints(customer, PointTransactionType.REDEEM))
                + Math.abs(sumPoints(customer, PointTransactionType.EXPIRE));
        AdminCustomerDetailResponse.CustomerProfile profile = new AdminCustomerDetailResponse.CustomerProfile(
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getStatus().name(),
                customer.getTier().name(),
                customer.getCreatedAt()
        );
        AdminCustomerDetailResponse.CustomerLoyalty loyaltySummary = new AdminCustomerDetailResponse.CustomerLoyalty(
                loyalty.currentPoints(),
                loyalty.tier(),
                loyalty.updatedAt()
        );
        AdminCustomerDetailResponse.CustomerSummary summary = new AdminCustomerDetailResponse.CustomerSummary(
                bookingRepository.countByCustomer(customer),
                bookingRepository.countByCustomerAndStatus(customer, BookingStatus.COMPLETED),
                bookingRepository.countByCustomerAndStatus(customer, BookingStatus.CANCELLED),
                washSessionRepository.countByBookingCustomerAndStatus(customer, WashSessionStatus.COMPLETED),
                bookingRepository.sumFinalAmountByCustomerAndStatus(customer, BookingStatus.COMPLETED),
                totalPointsEarned,
                totalPointsSpent,
                lastBooking == null ? null : lastBooking.getCreatedAt(),
                lastBooking == null ? null : lastBooking.getFinalAmount()
        );
        return new AdminCustomerDetailResponse(customer.getId(), profile, loyaltySummary, summary);
    }

    @Transactional(readOnly = true)
    public WashHistoryPage getWashHistory(UUID customerId, Instant dateFrom, Instant dateTo, int page, int limit) {
        validateDateRange(dateFrom, dateTo);
        AuthUser customer = requireCustomer(customerId);
        Page<WashSession> sessions = washSessionRepository.searchCustomerSessions(
                customer,
                dateFrom,
                dateTo,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );
        Map<String, String> serviceNames = serviceNames(sessions.getContent().stream().map(WashSession::getBooking).toList());
        List<AdminWashHistoryResponse> items = sessions.getContent().stream()
                .map(session -> toWashHistoryResponse(session, serviceNames))
                .toList();
        return new WashHistoryPage(items, pagination(sessions));
    }

    @Transactional(readOnly = true)
    public LoyaltyService.TransactionPage getPointHistory(
            UUID customerId,
            String type,
            Instant dateFrom,
            Instant dateTo,
            int page,
            int limit
    ) {
        validateDateRange(dateFrom, dateTo);
        requireCustomer(customerId);
        return loyaltyService.getTransactionHistory(customerId, type, dateFrom, dateTo, page, limit);
    }

    @Transactional(readOnly = true)
    public CustomerVehiclePage getCustomerVehicles(UUID customerId, int page, int limit) {
        AuthUser customer = requireCustomer(customerId);
        Page<CustomerVehicle> vehicles = customerVehicleRepository.findByOwnerAndStatusOrderByCreatedAtAsc(
                customer,
                VehicleStatus.ACTIVE,
                PageRequest.of(Math.max(page - 1, 0), limit)
        );
        List<AdminCustomerVehicleResponse> items = vehicles.getContent().stream()
                .map(this::toCustomerVehicleResponse)
                .toList();
        return new CustomerVehiclePage(items, pagination(vehicles));
    }

    @Transactional(readOnly = true)
    public TierHistoryPage getTierHistory(UUID customerId, int page, int limit) {
        AuthUser customer = requireCustomer(customerId);
        Page<PointTransaction> transactions = pointTransactionRepository.search(
                customer,
                PointTransactionType.TIER_UPGRADE,
                null,
                null,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );
        List<AdminTierHistoryResponse> items = transactions.getContent().stream()
                .map(transaction -> toTierHistoryResponse(customer, transaction))
                .toList();
        return new TierHistoryPage(items, pagination(transactions));
    }

    private AuthUser requireCustomer(UUID customerId) {
        AuthUser customer = authUserRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found", "RESOURCE_NOT_FOUND"));
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Customer not found", "RESOURCE_NOT_FOUND");
        }
        return customer;
    }

    private List<BookingStatus> parseStatuses(String status) {
        if (status == null || status.isBlank()) {
            return List.of();
        }
        return Arrays.stream(status.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(this::parseStatus)
                .distinct()
                .toList();
    }

    private BookingStatus parseStatus(String value) {
        try {
            return BookingStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Valid values: " + Arrays.toString(BookingStatus.values()),
                    "VALIDATION_ERROR"
            );
        }
    }

    private UserRole parseRole(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UserRole.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid role. Valid values: " + Arrays.toString(UserRole.values()),
                    "VALIDATION_ERROR"
            );
        }
    }

    private UserStatus parseUserStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Valid values: " + Arrays.toString(UserStatus.values()),
                    "VALIDATION_ERROR"
            );
        }
    }

    private void validateDateRange(LocalDate dateFrom, LocalDate dateTo) {
        if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "dateFrom must be before or equal to dateTo", "VALIDATION_ERROR");
        }
    }

    private void validateDateRange(Instant dateFrom, Instant dateTo) {
        if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "dateFrom must be before or equal to dateTo", "VALIDATION_ERROR");
        }
    }

    private String normalizeSearch(String searchQuery) {
        return searchQuery == null || searchQuery.isBlank() ? null : searchQuery.trim();
    }

    private Map<String, WashSession> sessionsByBookingId(List<CustomerBooking> bookings) {
        List<String> bookingIds = bookings.stream().map(CustomerBooking::getId).toList();
        if (bookingIds.isEmpty()) {
            return Map.of();
        }
        return washSessionRepository.findByBookingIdIn(bookingIds).stream()
                .collect(Collectors.toMap(session -> session.getBooking().getId(), Function.identity(), (first, second) -> first));
    }

    private Map<String, String> serviceNames(Collection<CustomerBooking> bookings) {
        List<String> packageIds = bookings.stream()
                .map(CustomerBooking::getPackageId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<String> comboIds = bookings.stream()
                .map(CustomerBooking::getComboId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, String> names = new HashMap<>();
        servicePackageRepository.findAllById(packageIds)
                .forEach(pkg -> names.put(pkg.getId(), pkg.getName()));
        serviceComboRepository.findAllById(comboIds)
                .forEach(combo -> names.put(combo.getId(), combo.getName()));
        return names;
    }

    private AdminBookingResponse toBookingResponse(CustomerBooking booking, WashSession session, Map<String, String> serviceNames) {
        return new AdminBookingResponse(
                booking.getId(),
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getCustomer().getFullName(),
                booking.getCustomer().getPhone(),
                booking.getVehicle().getPlate(),
                serviceId(booking),
                serviceNames.get(serviceId(booking)),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getFinalAmount(),
                booking.getPaymentMethod().name(),
                booking.getPaymentStatus().name(),
                booking.getStatus().name(),
                session == null ? null : session.getId(),
                session == null ? null : session.getStatus().name(),
                booking.getCreatedAt()
        );
    }

    private BookingStaffTransferAuditResponse toTransferAuditResponse(BookingStaffTransferAudit audit) {
        AuthUser fromStaff = audit.getFromStaff();
        AuthUser toStaff = audit.getToStaff();
        AuthUser actor = audit.getActor();
        return new BookingStaffTransferAuditResponse(
                audit.getId(),
                audit.getBooking().getId(),
                audit.getWashSession() == null ? null : audit.getWashSession().getId(),
                fromStaff == null ? null : fromStaff.getId(),
                fromStaff == null ? null : fromStaff.getFullName(),
                toStaff.getId(),
                toStaff.getFullName(),
                actor.getId(),
                actor.getFullName(),
                audit.getReason(),
                audit.getCreatedAt()
        );
    }

    private AdminAccountResponse toAccountResponse(AuthUser user) {
        return new AdminAccountResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getTier().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private AdminWashHistoryResponse toWashHistoryResponse(WashSession session, Map<String, String> serviceNames) {
        CustomerBooking booking = session.getBooking();
        String serviceId = serviceId(booking);
        return new AdminWashHistoryResponse(
                session.getId(),
                booking.getId(),
                booking.getVehicle().getPlate(),
                new AdminWashHistoryResponse.ServicePackageSummary(serviceId, serviceNames.get(serviceId)),
                session.getStatus().name(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                session.getStartedAt(),
                session.getCompletedAt(),
                new AdminWashHistoryResponse.Fee(session.getFeeAmount(), session.getFeeCurrency()),
                session.getAwardedLoyaltyPoints()
        );
    }

    private AdminCustomerVehicleResponse toCustomerVehicleResponse(CustomerVehicle vehicle) {
        return new AdminCustomerVehicleResponse(
                vehicle.getId(),
                vehicle.getPlate(),
                vehicle.getType().name(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.getStatus().name(),
                vehicle.isPrimary(),
                washSessionRepository.findLastCompletedAtByVehicle(vehicle, WashSessionStatus.COMPLETED),
                washSessionRepository.countByBookingVehicleAndStatus(vehicle, WashSessionStatus.COMPLETED)
        );
    }

    private AdminTierHistoryResponse toTierHistoryResponse(AuthUser customer, PointTransaction transaction) {
        TierChange tierChange = parseTierChange(transaction.getReason(), customer.getTier().name());
        return new AdminTierHistoryResponse(
                transaction.getId(),
                tierChange.fromTier(),
                tierChange.toTier(),
                transaction.getReason(),
                transaction.getBalanceAfter(),
                transaction.getCreatedAt()
        );
    }

    private TierChange parseTierChange(String reason, String fallbackTier) {
        String prefix = "Tier upgraded from ";
        String separator = " to ";
        if (reason != null && reason.startsWith(prefix) && reason.contains(separator)) {
            String payload = reason.substring(prefix.length());
            String[] parts = payload.split(separator, 2);
            if (parts.length == 2) {
                return new TierChange(parts[0], parts[1]);
            }
        }
        return new TierChange(null, fallbackTier);
    }

    private String serviceId(CustomerBooking booking) {
        return booking.getPackageId() == null ? booking.getComboId() : booking.getPackageId();
    }

    private long sumPoints(AuthUser customer, PointTransactionType type) {
        return pointTransactionRepository.sumPointsByCustomerAndType(customer, type);
    }

    private PaginationMeta pagination(Page<?> page) {
        return new PaginationMeta(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages(), page.hasNext());
    }

    public record BookingPage(List<AdminBookingResponse> items, PaginationMeta pagination) {
    }

    public record TransferAuditPage(List<BookingStaffTransferAuditResponse> items, PaginationMeta pagination) {
    }

    public record AccountPage(List<AdminAccountResponse> items, PaginationMeta pagination) {
    }

    public record WashHistoryPage(List<AdminWashHistoryResponse> items, PaginationMeta pagination) {
    }

    public record CustomerVehiclePage(List<AdminCustomerVehicleResponse> items, PaginationMeta pagination) {
    }

    public record TierHistoryPage(List<AdminTierHistoryResponse> items, PaginationMeta pagination) {
    }

    private record TierChange(String fromTier, String toTier) {
    }
}
