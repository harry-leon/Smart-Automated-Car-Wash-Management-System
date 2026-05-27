package com.autowash.admin.service;

import com.autowash.admin.dto.AdminBookingResponse;
import com.autowash.admin.dto.AdminCustomerDetailResponse;
import com.autowash.admin.dto.AdminWashHistoryResponse;
import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.catalog.repository.ServiceComboRepository;
import com.autowash.catalog.repository.ServicePackageRepository;
import com.autowash.loyalty.dto.LoyaltyAccountResponse;
import com.autowash.loyalty.dto.PointTransactionResponse;
import com.autowash.loyalty.entity.PointTransactionType;
import com.autowash.loyalty.repository.PointTransactionRepository;
import com.autowash.loyalty.service.LoyaltyService;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
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

    public AdminReportingService(
            CustomerBookingRepository bookingRepository,
            WashSessionRepository washSessionRepository,
            AuthUserRepository authUserRepository,
            ServicePackageRepository servicePackageRepository,
            ServiceComboRepository serviceComboRepository,
            LoyaltyService loyaltyService,
            PointTransactionRepository pointTransactionRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.washSessionRepository = washSessionRepository;
        this.authUserRepository = authUserRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.serviceComboRepository = serviceComboRepository;
        this.loyaltyService = loyaltyService;
        this.pointTransactionRepository = pointTransactionRepository;
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
        Page<CustomerBooking> bookings = bookingRepository.searchAdmin(
                statuses,
                !statuses.isEmpty(),
                customerId,
                dateFrom,
                dateTo,
                normalizeSearch(searchQuery),
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("createdAt").descending())
        );

        Map<String, WashSession> sessionsByBookingId = sessionsByBookingId(bookings.getContent());
        Map<String, String> serviceNames = serviceNames(bookings.getContent());
        List<AdminBookingResponse> items = bookings.getContent().stream()
                .map(booking -> toBookingResponse(booking, sessionsByBookingId.get(booking.getId()), serviceNames))
                .toList();
        return new BookingPage(items, pagination(bookings));
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
        Page<WashSession> sessions = washSessionRepository.searchCustomerCompletedSessions(
                customer,
                WashSessionStatus.COMPLETED,
                dateFrom,
                dateTo,
                PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("completedAt").descending())
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
            return BookingStatus.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Valid values: " + Arrays.toString(BookingStatus.values()),
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

    public record WashHistoryPage(List<AdminWashHistoryResponse> items, PaginationMeta pagination) {
    }
}
