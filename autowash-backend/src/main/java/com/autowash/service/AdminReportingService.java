package com.autowash.service;

import com.autowash.dto.AdminBookingResponse;
import com.autowash.dto.AdminBusinessHealthReportResponse;
import com.autowash.dto.AdminAccountResponse;
import com.autowash.dto.AdminCustomerDetailResponse;
import com.autowash.dto.AdminCustomerVehicleResponse;
import com.autowash.dto.AdminTierHistoryResponse;
import com.autowash.dto.AdminWashHistoryResponse;
import com.autowash.dto.UpdateAdminCustomerRoleResponse;
import com.autowash.entity.AuthUser;
import com.autowash.entity.enums.UserRole;
import com.autowash.entity.enums.UserStatus;
import com.autowash.repository.AuthUserRepository;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.entity.CustomerBooking;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.repository.ServiceComboRepository;
import com.autowash.repository.ServicePackageRepository;
import com.autowash.dto.LoyaltyAccountResponse;
import com.autowash.dto.PointTransactionResponse;
import com.autowash.entity.enums.PointTransactionType;
import com.autowash.entity.PointTransaction;
import com.autowash.repository.PointTransactionRepository;
import com.autowash.service.LoyaltyService;
import com.autowash.dto.BookingStaffTransferAuditResponse;
import com.autowash.entity.BookingStaffTransferAudit;
import com.autowash.entity.WashSession;
import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.BookingStaffTransferAuditRepository;
import com.autowash.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.entity.CustomerVehicle;
import com.autowash.entity.enums.VehicleStatus;
import com.autowash.repository.CustomerVehicleRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
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
    private static final EnumSet<BookingStatus> REVENUE_STATUSES = EnumSet.of(
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED
    );

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
    public AdminAccountResponse getAccountDetail(UUID accountId) {
        AuthUser account = authUserRepository.findById(accountId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found", "RESOURCE_NOT_FOUND"));
        return toAccountResponse(account);
    }

    @Transactional(readOnly = true)
    public AdminBusinessHealthReportResponse getBusinessHealthReport(
            String range,
            String analysisGroup,
            LocalDate customDateFrom,
            LocalDate customDateTo
    ) {
        ReportWindow window = ReportWindow.resolve(range, customDateFrom, customDateTo);
        validateDateRange(window.currentFrom(), window.currentTo());
        validateDateRange(window.previousFrom(), window.previousTo());

        List<CustomerBooking> allBookings = bookingRepository.findAll();
        List<WashSession> allSessions = washSessionRepository.findAllByOrderByCreatedAtDesc();

        List<CustomerBooking> currentBookings = filterBookingsByDate(allBookings, window.currentFrom(), window.currentTo());
        List<CustomerBooking> previousBookings = filterBookingsByDate(allBookings, window.previousFrom(), window.previousTo());
        List<WashSession> currentCompletedSessions = filterCompletedSessionsByDate(allSessions, window.currentFrom(), window.currentTo());
        List<WashSession> previousCompletedSessions = filterCompletedSessionsByDate(allSessions, window.previousFrom(), window.previousTo());

        Map<String, String> serviceNames = serviceNames(allBookings);
        long currentRevenue = sumRevenue(currentBookings);
        long previousRevenue = sumRevenue(previousBookings);
        long completedBookings = currentCompletedSessions.size();
        long previousCompletedBookings = previousCompletedSessions.size();
        long averageBookingValue = currentBookings.isEmpty() ? 0 : Math.round((double) currentRevenue / currentBookings.size());
        double cancellationRate = percentage(countCancelled(currentBookings), currentBookings.size());
        long discountAssistedRevenue = currentBookings.stream()
                .filter(this::isDiscountAssisted)
                .mapToLong(CustomerBooking::getFinalAmount)
                .sum();

        AdminBusinessHealthReportResponse.Kpis kpis = new AdminBusinessHealthReportResponse.Kpis(
                currentRevenue,
                previousRevenue,
                growthRate(currentRevenue, previousRevenue),
                completedBookings,
                growthRate(completedBookings, previousCompletedBookings),
                averageBookingValue,
                cancellationRate,
                discountAssistedRevenue
        );

        AdminBusinessHealthReportResponse.Trends trends = new AdminBusinessHealthReportResponse.Trends(
                buildRevenueTrend(currentBookings, previousBookings, window),
                buildCompletedBookingsTrend(currentCompletedSessions, previousCompletedSessions, window)
        );

        AdminBusinessHealthReportResponse.Breakdowns breakdowns = new AdminBusinessHealthReportResponse.Breakdowns(
                buildRevenueBreakdown(currentBookings, currentRevenue),
                buildServiceBreakdown(currentBookings, currentRevenue, serviceNames),
                buildPromotionBreakdown(currentBookings, currentRevenue),
                new AdminBusinessHealthReportResponse.Breakdown(false, List.of(), "Channel data is unavailable in the current data model.")
        );

        List<AdminBusinessHealthReportResponse.Insight> insights = buildInsights(
                currentBookings,
                previousBookings,
                currentRevenue,
                previousRevenue,
                cancellationRate,
                percentage(countCancelled(previousBookings), previousBookings.size()),
                breakdowns.service().items()
        );

        List<AdminBusinessHealthReportResponse.BreakdownItem> topServices = breakdowns.service().items().stream()
                .limit(5)
                .toList();

        return new AdminBusinessHealthReportResponse(
                new AdminBusinessHealthReportResponse.Period(window.key(), window.label(), window.currentFrom().toString(), window.currentTo().toString()),
                new AdminBusinessHealthReportResponse.Period("PREVIOUS", "Previous period", window.previousFrom().toString(), window.previousTo().toString()),
                kpis,
                trends,
                breakdowns,
                insights,
                new AdminBusinessHealthReportResponse.TopItems(topServices),
                new AdminBusinessHealthReportResponse.Capabilities(false, false)
        );
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
    public com.autowash.dto.BookingDetailResponse getBookingDetail(String bookingId) {
        CustomerBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
        
        String packageName = null;
        if (booking.getPackageId() != null) {
            packageName = servicePackageRepository.findById(booking.getPackageId())
                    .map(com.autowash.entity.ServicePackage::getName)
                    .orElse(booking.getPackageId());
        } else if (booking.getComboId() != null) {
            packageName = serviceComboRepository.findById(booking.getComboId())
                    .map(com.autowash.entity.ServiceCombo::getName)
                    .orElse(booking.getComboId());
        }

        var washSession = washSessionRepository.findFirstByBookingIdOrderByCompletedAtDesc(booking.getId())
                .orElse(null);

        List<com.autowash.dto.AddonSelectionResponse> addonSelections = booking.getAddons().stream()
                .map(addon -> new com.autowash.dto.AddonSelectionResponse(addon.getAddonId(), addon.getAddonName(), addon.getAddonPrice()))
                .toList();

        return new com.autowash.dto.BookingDetailResponse(
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
                new com.autowash.dto.BookingDetailResponse.Pricing(
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
                new com.autowash.dto.BookingDetailResponse.Scheduling(
                        booking.getBookingDate(),
                        booking.getBookingTime().toString(),
                        booking.getEstimatedDurationMinutes(),
                        booking.getBookingTime().plusMinutes(booking.getEstimatedDurationMinutes()).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                ),
                new com.autowash.dto.BookingDetailResponse.Payment(
                        booking.getPaymentMethod().name(),
                        booking.getPaymentStatus().name(),
                        "TXN_" + booking.getId(),
                        booking.getCreatedAt()
                ),
                booking.getStatus().name(),
                booking.getConfirmationStatus().name(),
                booking.getConfirmationExpiresAt(),
                washSession == null ? null : washSession.getId().toString(),
                null,
                washSession == null ? null : washSession.getStatus().name(),
                washSession == null ? null : washSession.getNotes(),
                booking.getCreatedAt(),
                null
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
                customer.getRole().name(),
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

    @Transactional
    public UpdateAdminCustomerRoleResponse updateCustomerRole(UUID customerId, String role) {
        AuthUser customer = requireCustomer(customerId);
        UserRole nextRole = parseRole(role);
        customer.updateRole(nextRole);
        AuthUser savedCustomer = authUserRepository.save(customer);
        return new UpdateAdminCustomerRoleResponse(
                savedCustomer.getId(),
                savedCustomer.getRole().name(),
                savedCustomer.getUpdatedAt()
        );
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
                PointTransactionType.ADJUST,
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
        List<java.util.UUID> packageIds = bookings.stream()
                .map(CustomerBooking::getPackageIdValue)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<java.util.UUID> comboIds = bookings.stream()
                .map(CustomerBooking::getComboIdValue)
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
        String staffName = booking.getAssignedStaff() == null ? null : booking.getAssignedStaff().getFullName();
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
                booking.getCreatedAt(),
                staffName
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

    private List<CustomerBooking> filterBookingsByDate(List<CustomerBooking> bookings, LocalDate dateFrom, LocalDate dateTo) {
        return bookings.stream()
                .filter(booking -> !booking.getBookingDate().isBefore(dateFrom))
                .filter(booking -> !booking.getBookingDate().isAfter(dateTo))
                .toList();
    }

    private List<WashSession> filterCompletedSessionsByDate(List<WashSession> sessions, LocalDate dateFrom, LocalDate dateTo) {
        return sessions.stream()
                .filter(session -> session.getCompletedAt() != null)
                .filter(session -> session.getCompletedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate().compareTo(dateFrom) >= 0)
                .filter(session -> session.getCompletedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate().compareTo(dateTo) <= 0)
                .toList();
    }

    private long sumRevenue(List<CustomerBooking> bookings) {
        return bookings.stream()
                .filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()))
                .mapToLong(CustomerBooking::getFinalAmount)
                .sum();
    }

    private long countCancelled(List<CustomerBooking> bookings) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CANCELLED)
                .count();
    }

    private boolean isDiscountAssisted(CustomerBooking booking) {
        return booking.getVoucherDiscount() > 0 || booking.getVoucherCode() != null;
    }

    private double growthRate(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? 0 : 100;
        }
        return roundTwoDecimals(((double) (current - previous) / previous) * 100);
    }

    private double percentage(long part, long total) {
        if (total == 0) {
            return 0;
        }
        return roundTwoDecimals(((double) part / total) * 100);
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private AdminBusinessHealthReportResponse.Series buildRevenueTrend(
            List<CustomerBooking> currentBookings,
            List<CustomerBooking> previousBookings,
            ReportWindow window
    ) {
        return new AdminBusinessHealthReportResponse.Series(
                buildDailyPoints(currentBookings, window.currentFrom(), window.currentTo(), booking -> REVENUE_STATUSES.contains(booking.getStatus()) ? booking.getFinalAmount() : 0),
                buildDailyPoints(previousBookings, window.previousFrom(), window.previousTo(), booking -> REVENUE_STATUSES.contains(booking.getStatus()) ? booking.getFinalAmount() : 0)
        );
    }

    private AdminBusinessHealthReportResponse.Series buildCompletedBookingsTrend(
            List<WashSession> currentSessions,
            List<WashSession> previousSessions,
            ReportWindow window
    ) {
        return new AdminBusinessHealthReportResponse.Series(
                buildDailySessionPoints(currentSessions, window.currentFrom(), window.currentTo()),
                buildDailySessionPoints(previousSessions, window.previousFrom(), window.previousTo())
        );
    }

    private List<AdminBusinessHealthReportResponse.Point> buildDailyPoints(
            List<CustomerBooking> bookings,
            LocalDate dateFrom,
            LocalDate dateTo,
            java.util.function.ToLongFunction<CustomerBooking> mapper
    ) {
        List<AdminBusinessHealthReportResponse.Point> points = new ArrayList<>();
        for (LocalDate cursor = dateFrom; !cursor.isAfter(dateTo); cursor = cursor.plusDays(1)) {
            LocalDate current = cursor;
            long value = bookings.stream()
                    .filter(booking -> booking.getBookingDate().isEqual(current))
                    .mapToLong(mapper)
                    .sum();
            points.add(new AdminBusinessHealthReportResponse.Point(shortDateLabel(current), value));
        }
        return points;
    }

    private List<AdminBusinessHealthReportResponse.Point> buildDailySessionPoints(
            List<WashSession> sessions,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        List<AdminBusinessHealthReportResponse.Point> points = new ArrayList<>();
        for (LocalDate cursor = dateFrom; !cursor.isAfter(dateTo); cursor = cursor.plusDays(1)) {
            LocalDate current = cursor;
            long value = sessions.stream()
                    .filter(session -> session.getCompletedAt() != null)
                    .filter(session -> session.getCompletedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate().isEqual(current))
                    .count();
            points.add(new AdminBusinessHealthReportResponse.Point(shortDateLabel(current), value));
        }
        return points;
    }

    private String shortDateLabel(LocalDate date) {
        return date.getMonthValue() + "/" + date.getDayOfMonth();
    }

    private AdminBusinessHealthReportResponse.Breakdown buildRevenueBreakdown(List<CustomerBooking> bookings, long totalRevenue) {
        long discountRevenue = bookings.stream()
                .filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()))
                .filter(this::isDiscountAssisted)
                .mapToLong(CustomerBooking::getFinalAmount)
                .sum();
        long fullPriceRevenue = Math.max(totalRevenue - discountRevenue, 0);

        return new AdminBusinessHealthReportResponse.Breakdown(
                true,
                List.of(
                        new AdminBusinessHealthReportResponse.BreakdownItem(
                                "full-price",
                                "Full price",
                                fullPriceRevenue,
                                bookings.stream().filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()) && !isDiscountAssisted(booking)).count(),
                                percentage(fullPriceRevenue, totalRevenue)
                        ),
                        new AdminBusinessHealthReportResponse.BreakdownItem(
                                "discount-assisted",
                                "Discount-assisted",
                                discountRevenue,
                                bookings.stream().filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()) && isDiscountAssisted(booking)).count(),
                                percentage(discountRevenue, totalRevenue)
                        )
                ),
                null
        );
    }

    private AdminBusinessHealthReportResponse.Breakdown buildServiceBreakdown(
            List<CustomerBooking> bookings,
            long totalRevenue,
            Map<String, String> serviceNames
    ) {
        Map<String, List<CustomerBooking>> grouped = bookings.stream()
                .filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()))
                .collect(Collectors.groupingBy(this::serviceId));

        List<AdminBusinessHealthReportResponse.BreakdownItem> items = grouped.entrySet().stream()
                .map(entry -> {
                    long revenue = entry.getValue().stream().mapToLong(CustomerBooking::getFinalAmount).sum();
                    return new AdminBusinessHealthReportResponse.BreakdownItem(
                            entry.getKey(),
                            serviceNames.getOrDefault(entry.getKey(), entry.getKey()),
                            revenue,
                            entry.getValue().size(),
                            percentage(revenue, totalRevenue)
                    );
                })
                .sorted(Comparator.comparingLong(AdminBusinessHealthReportResponse.BreakdownItem::revenue).reversed())
                .toList();

        return new AdminBusinessHealthReportResponse.Breakdown(true, items, null);
    }

    private AdminBusinessHealthReportResponse.Breakdown buildPromotionBreakdown(List<CustomerBooking> bookings, long totalRevenue) {
        Map<String, List<CustomerBooking>> grouped = bookings.stream()
                .filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()))
                .filter(this::isDiscountAssisted)
                .collect(Collectors.groupingBy(booking -> booking.getVoucherCode() == null ? "DISCOUNT_APPLIED" : booking.getVoucherCode()));

        List<AdminBusinessHealthReportResponse.BreakdownItem> items = grouped.entrySet().stream()
                .map(entry -> {
                    long revenue = entry.getValue().stream().mapToLong(CustomerBooking::getFinalAmount).sum();
                    return new AdminBusinessHealthReportResponse.BreakdownItem(
                            entry.getKey(),
                            entry.getKey(),
                            revenue,
                            entry.getValue().size(),
                            percentage(revenue, totalRevenue)
                    );
                })
                .sorted(Comparator.comparingLong(AdminBusinessHealthReportResponse.BreakdownItem::revenue).reversed())
                .toList();

        String message = "Promotion contribution is approximated from voucher and discount-assisted bookings.";
        return new AdminBusinessHealthReportResponse.Breakdown(true, items, message);
    }

    private List<AdminBusinessHealthReportResponse.Insight> buildInsights(
            List<CustomerBooking> currentBookings,
            List<CustomerBooking> previousBookings,
            long currentRevenue,
            long previousRevenue,
            double currentCancellationRate,
            double previousCancellationRate,
            List<AdminBusinessHealthReportResponse.BreakdownItem> serviceItems
    ) {
        List<AdminBusinessHealthReportResponse.Insight> insights = new ArrayList<>();

        double revenueGrowth = growthRate(currentRevenue, previousRevenue);
        String revenueTone = revenueGrowth > 0 ? "positive" : revenueGrowth < 0 ? "negative" : "neutral";
        insights.add(new AdminBusinessHealthReportResponse.Insight(
                revenueTone,
                "Revenue momentum",
                revenueGrowth >= 0
                        ? "Revenue is up " + revenueGrowth + "% compared with the previous period."
                        : "Revenue is down " + Math.abs(revenueGrowth) + "% compared with the previous period."
        ));

        if (!serviceItems.isEmpty()) {
            AdminBusinessHealthReportResponse.BreakdownItem topService = serviceItems.getFirst();
            insights.add(new AdminBusinessHealthReportResponse.Insight(
                    "neutral",
                    "Top service contributor",
                    topService.label() + " is leading revenue contribution with " + topService.bookings() + " bookings in the selected period."
            ));
        }

        double cancellationDelta = roundTwoDecimals(currentCancellationRate - previousCancellationRate);
        String cancellationTone = cancellationDelta > 0 ? "negative" : cancellationDelta < 0 ? "positive" : "neutral";
        insights.add(new AdminBusinessHealthReportResponse.Insight(
                cancellationTone,
                "Cancellation pressure",
                cancellationDelta > 0
                        ? "Cancellation rate increased by " + cancellationDelta + " percentage points versus the previous period."
                        : cancellationDelta < 0
                        ? "Cancellation rate improved by " + Math.abs(cancellationDelta) + " percentage points versus the previous period."
                        : "Cancellation rate is stable versus the previous period."
        ));

        long discountAssistedBookings = currentBookings.stream().filter(this::isDiscountAssisted).count();
        if (discountAssistedBookings > 0) {
            insights.add(new AdminBusinessHealthReportResponse.Insight(
                    "neutral",
                    "Promotion visibility",
                    "Discount-assisted bookings are tracked, but exact campaign attribution remains limited by the current data model."
            ));
        }

        return insights;
    }

    private record ReportWindow(
            String key,
            String label,
            LocalDate currentFrom,
            LocalDate currentTo,
            LocalDate previousFrom,
            LocalDate previousTo
    ) {
        private static ReportWindow resolve(String range, LocalDate customDateFrom, LocalDate customDateTo) {
            LocalDate today = LocalDate.now();
            String normalizedRange = range == null ? "LAST_30_DAYS" : range.trim().toUpperCase();
            return switch (normalizedRange) {
                case "LAST_7_DAYS" -> rollingWindow("LAST_7_DAYS", "Last 7 days", today.minusDays(6), today);
                case "THIS_MONTH" -> {
                    LocalDate start = today.withDayOfMonth(1);
                    yield windowWithEquivalentPrevious("THIS_MONTH", "This month", start, today);
                }
                case "THIS_QUARTER" -> {
                    LocalDate start = startOfQuarter(today);
                    yield windowWithEquivalentPrevious("THIS_QUARTER", "This quarter", start, today);
                }
                case "CUSTOM" -> {
                    if (customDateFrom == null || customDateTo == null) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Custom range requires dateFrom and dateTo", "VALIDATION_ERROR");
                    }
                    yield windowWithEquivalentPrevious("CUSTOM", "Custom range", customDateFrom, customDateTo);
                }
                default -> rollingWindow("LAST_30_DAYS", "Last 30 days", today.minusDays(29), today);
            };
        }

        private static ReportWindow rollingWindow(String key, String label, LocalDate currentFrom, LocalDate currentTo) {
            long days = ChronoUnit.DAYS.between(currentFrom, currentTo) + 1;
            LocalDate previousTo = currentFrom.minusDays(1);
            LocalDate previousFrom = previousTo.minusDays(days - 1);
            return new ReportWindow(key, label, currentFrom, currentTo, previousFrom, previousTo);
        }

        private static ReportWindow windowWithEquivalentPrevious(String key, String label, LocalDate currentFrom, LocalDate currentTo) {
            long days = ChronoUnit.DAYS.between(currentFrom, currentTo) + 1;
            LocalDate previousTo = currentFrom.minusDays(1);
            LocalDate previousFrom = previousTo.minusDays(days - 1);
            return new ReportWindow(key, label, currentFrom, currentTo, previousFrom, previousTo);
        }

        private static LocalDate startOfQuarter(LocalDate date) {
            Month firstMonthOfQuarter = Month.of(((date.getMonthValue() - 1) / 3) * 3 + 1);
            return LocalDate.of(date.getYear(), firstMonthOfQuarter, 1).with(TemporalAdjusters.firstDayOfMonth());
        }
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
