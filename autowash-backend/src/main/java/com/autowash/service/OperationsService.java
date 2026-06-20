package com.autowash.service;

import com.autowash.entity.*;
import com.autowash.entity.enums.BookingStatus;

import com.autowash.repository.CustomerBookingRepository;
import com.autowash.service.BookingService;
import com.autowash.dto.EarnPointsResponse;
import com.autowash.service.LoyaltyService;
import com.autowash.dto.CheckInWashSessionResponse;
import com.autowash.dto.CompleteWashSessionResponse;
import com.autowash.dto.CreateWashSessionRequest;
import com.autowash.dto.CreateWashSessionResponse;
import com.autowash.dto.EligibleSessionBookingResponse;
import com.autowash.dto.OperationsQueueResponse;
import com.autowash.dto.QueueWashSessionResponse;
import com.autowash.dto.StartWashSessionResponse;
import com.autowash.dto.StaffDashboardSummaryResponse;
import com.autowash.dto.StaffOptionResponse;
import com.autowash.dto.TransferWashSessionRequest;
import com.autowash.dto.TransferWashSessionResponse;


import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.BookingStaffTransferAuditRepository;
import com.autowash.repository.WashSessionRepository;

import com.autowash.entity.enums.UserRole;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.CurrentUserService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationsService {

    private static final Set<WashSessionStatus> ACTIVE_SESSION_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS
    );

    private final BookingService bookingService;
    private final CustomerBookingRepository customerBookingRepository;
    private final WashSessionRepository washSessionRepository;
    private final BookingStaffTransferAuditRepository transferAuditRepository;
    private final LoyaltyService loyaltyService;
    private final CurrentUserService currentUserService;
    private final StaffAssignmentService staffAssignmentService;
    private final String currency;

    public OperationsService(
            BookingService bookingService,
            CustomerBookingRepository customerBookingRepository,
            WashSessionRepository washSessionRepository,
            BookingStaffTransferAuditRepository transferAuditRepository,
            LoyaltyService loyaltyService,
            CurrentUserService currentUserService,
            StaffAssignmentService staffAssignmentService,
            @Value("${autowash.currency}") String currency
    ) {
        this.bookingService = bookingService;
        this.customerBookingRepository = customerBookingRepository;
        this.washSessionRepository = washSessionRepository;
        this.transferAuditRepository = transferAuditRepository;
        this.loyaltyService = loyaltyService;
        this.currentUserService = currentUserService;
        this.staffAssignmentService = staffAssignmentService;
        this.currency = currency;
    }

    @Transactional
    public CreateWashSessionResponse createSession(CreateWashSessionRequest request) {
        CustomerBooking booking = bookingService.requireBookingForOperations(request.bookingId());
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Booking must be CONFIRMED to create a wash session",
                    "BUSINESS_RULE_VIOLATION"
            );
        }
        if (washSessionRepository.existsByBookingIdAndStatusIn(booking.getId(), ACTIVE_SESSION_STATUSES)) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Booking already has an active wash session",
                    "DUPLICATE_ACTIVE_SESSION"
            );
        }

        AuthUser actor = currentUserService.getCurrentUser();
        AuthUser assignedStaff = resolveSessionAssigneeForCreate(booking, actor);
        WashSession session = washSessionRepository.save(new WashSession(booking, request.notes(), assignedStaff));
        return new CreateWashSessionResponse(
                session.getId(),
                session.getStatus().name(),
                booking.getId(),
                session.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public OperationsQueueResponse getQueue() {
        AuthUser currentUser = currentUserService.getCurrentUser();
        List<WashSession> sessions = currentUser.getRole() == UserRole.STAFF
                ? washSessionRepository.findByAssignedStaffOrderByCreatedAtDesc(currentUser)
                : washSessionRepository.findAllByOrderByCreatedAtDesc();
        Map<WashSessionStatus, List<OperationsQueueResponse.WashSessionCard>> cardsByStatus = sessions.stream()
                .map(this::toQueueCard)
                .collect(Collectors.groupingBy(
                        card -> WashSessionStatus.valueOf(card.status()),
                        () -> new java.util.EnumMap<>(WashSessionStatus.class),
                        Collectors.toCollection(ArrayList::new)
                ));

        List<OperationsQueueResponse.QueueColumn> columns = List.of(
                column("PENDING", "Pending", cardsByStatus, WashSessionStatus.PENDING),
                column(WashSessionStatus.CHECKED_IN, "Checked-In", cardsByStatus),
                column(WashSessionStatus.IN_PROGRESS, "In Progress", cardsByStatus),
                column(WashSessionStatus.COMPLETED, "Completed", cardsByStatus)
        );

        return new OperationsQueueResponse(
                new OperationsQueueResponse.QueueSummary(
                        sessions.size(),
                        count(sessions, WashSessionStatus.PENDING),
                        count(sessions, WashSessionStatus.CHECKED_IN),
                        count(sessions, WashSessionStatus.IN_PROGRESS),
                        count(sessions, WashSessionStatus.COMPLETED)
                ),
                columns,
                Instant.now()
        );
    }

    @Transactional(readOnly = true)
    public List<EligibleSessionBookingResponse> listEligibleSessionBookings(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        AuthUser currentUser = currentUserService.getCurrentUser();
        List<CustomerBooking> bookings = currentUser.getRole() == UserRole.STAFF
                ? customerBookingRepository.findEligibleForAssignedStaffOperationsSession(
                        currentUser,
                        BookingStatus.CONFIRMED,
                        ACTIVE_SESSION_STATUSES,
                        PageRequest.of(0, safeLimit))
                : customerBookingRepository.findEligibleForOperationsSession(
                        BookingStatus.CONFIRMED,
                        ACTIVE_SESSION_STATUSES,
                        PageRequest.of(0, safeLimit));
        return bookings
                .stream()
                .map(this::toEligibleBooking)
                .toList();
    }

    @Transactional
    public QueueWashSessionResponse queueSession(UUID sessionId) {
        WashSession session = requireSessionForCurrentUser(sessionId);
        Instant queuedAt = Instant.now();
        session.queue(queuedAt);
        return new QueueWashSessionResponse(session.getId(), session.getStatus().name(), session.getQueuedAt());
    }

    @Transactional
    public CheckInWashSessionResponse checkInSession(UUID sessionId) {
        WashSession session = requireSessionForCurrentUser(sessionId);
        CustomerBooking booking = session.getBooking();
        int projectedPoints = loyaltyService.calculateEarnPoints(sessionId);

        Instant checkedInAt = Instant.now();
        session.checkIn(checkedInAt, booking.getFinalAmount(), currency, projectedPoints);
        bookingService.updateStatus(booking, BookingStatus.CHECKED_IN);
        return new CheckInWashSessionResponse(
                session.getId(),
                session.getStatus().name(),
                session.getCheckedInAt(),
                new CheckInWashSessionResponse.Fee(session.getFeeAmount(), session.getFeeCurrency()),
                session.getProjectedLoyaltyPoints()
        );
    }

    @Transactional
    public StartWashSessionResponse startSession(UUID sessionId) {
        WashSession session = requireSessionForCurrentUser(sessionId);
        Instant startedAt = Instant.now();
        session.start(startedAt);
        bookingService.updateStatus(session.getBooking(), BookingStatus.IN_PROGRESS);
        return new StartWashSessionResponse(session.getId(), session.getStatus().name(), session.getStartedAt());
    }

    @Transactional
    public CompleteWashSessionResponse completeSession(UUID sessionId) {
        WashSession session = requireSessionForCurrentUser(sessionId);
        int projectedPoints = loyaltyService.calculateEarnPoints(sessionId);

        Instant completedAt = Instant.now();
        session.complete(completedAt, projectedPoints);
        EarnPointsResponse earnResult = loyaltyService.postEarnTransaction(
                session.getBooking().getCustomer().getId(),
                sessionId
        );
        bookingService.updateStatus(session.getBooking(), BookingStatus.COMPLETED);
        markCustomerAsNotNew(session.getBooking().getCustomer());
        return new CompleteWashSessionResponse(
                session.getId(),
                session.getStatus().name(),
                session.getCompletedAt(),
                earnResult.pointsAwarded()
        );
    }

    @Transactional(readOnly = true)
    public StaffDashboardSummaryResponse getStaffSummary() {
        AuthUser staff = currentUserService.getCurrentUser();
        if (staff.getRole() != UserRole.STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Staff role required", "FORBIDDEN");
        }
        long completedRevenue = customerBookingRepository.sumFinalAmountByAssignedStaffAndStatus(staff, BookingStatus.COMPLETED);
        long kpiTargetRevenue = 5_000_000L;
        int progress = kpiTargetRevenue == 0 ? 100 : (int) Math.min(100, Math.round(completedRevenue * 100.0 / kpiTargetRevenue));
        return new StaffDashboardSummaryResponse(
                staff.getId().toString(),
                staff.getFullName(),
                customerBookingRepository.countByAssignedStaffAndStatusIn(staff, Set.of(
                        BookingStatus.CONFIRMED,
                        BookingStatus.CHECKED_IN,
                        BookingStatus.IN_PROGRESS
                )),
                customerBookingRepository.countByAssignedStaffAndStatus(staff, BookingStatus.CONFIRMED),
                washSessionRepository.countByAssignedStaffAndStatusIn(staff, Set.of(
                        WashSessionStatus.PENDING,
                        WashSessionStatus.CHECKED_IN,
                        WashSessionStatus.IN_PROGRESS
                )),
                washSessionRepository.countByAssignedStaffAndStatus(staff, WashSessionStatus.COMPLETED),
                completedRevenue,
                kpiTargetRevenue,
                progress
        );
    }

    @Transactional(readOnly = true)
    public List<StaffOptionResponse> listActiveStaff() {
        return staffAssignmentService.listActiveStaff().stream()
                .map(staff -> new StaffOptionResponse(staff.getId(), staff.getFullName()))
                .toList();
    }

    @Transactional
    public TransferWashSessionResponse transferSession(UUID sessionId, TransferWashSessionRequest request) {
        WashSession session = requireSessionForCurrentUser(sessionId);
        AuthUser actor = currentUserService.getCurrentUser();
        AuthUser fromStaff = session.getAssignedStaff();
        AuthUser toStaff = staffAssignmentService.requireActiveStaff(request.toStaffId());
        if (fromStaff != null && fromStaff.getId().equals(toStaff.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is already assigned to this staff", "DUPLICATE_ASSIGNMENT");
        }

        CustomerBooking booking = session.getBooking();
        booking.assignStaff(toStaff);
        session.assignStaff(toStaff);
        BookingStaffTransferAudit audit = transferAuditRepository.save(new BookingStaffTransferAudit(
                booking,
                session,
                fromStaff,
                toStaff,
                actor,
                request.reason()
        ));
        return toTransferResponse(audit);
    }

    private void markCustomerAsNotNew(AuthUser customer) {
        if (customer.isNewCustomer()) {
            customer.markNotNewCustomer();
        }
    }

    private WashSession requireSession(UUID sessionId) {
        return washSessionRepository.findWithBookingById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND"));
    }

    private WashSession requireSessionForCurrentUser(UUID sessionId) {
        WashSession session = requireSession(sessionId);
        AuthUser currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != UserRole.STAFF) {
            return session;
        }
        AuthUser assignedStaff = session.getAssignedStaff();
        if (assignedStaff == null || !assignedStaff.getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Wash session not found", "RESOURCE_NOT_FOUND");
        }
        return session;
    }

    private AuthUser resolveSessionAssigneeForCreate(CustomerBooking booking, AuthUser actor) {
        AuthUser assignedStaff = booking.getAssignedStaff();
        if (actor.getRole() == UserRole.STAFF) {
            if (assignedStaff == null || !assignedStaff.getId().equals(actor.getId())) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND");
            }
            return actor;
        }
        if (assignedStaff == null) {
            assignedStaff = staffAssignmentService.pickLeastLoadedActiveStaff();
            booking.assignStaff(assignedStaff);
        }
        return assignedStaff;
    }

    private TransferWashSessionResponse toTransferResponse(BookingStaffTransferAudit audit) {
        AuthUser fromStaff = audit.getFromStaff();
        AuthUser toStaff = audit.getToStaff();
        return new TransferWashSessionResponse(
                audit.getId(),
                audit.getWashSession() == null ? null : audit.getWashSession().getId(),
                audit.getBooking().getId(),
                fromStaff == null ? null : fromStaff.getId(),
                fromStaff == null ? null : fromStaff.getFullName(),
                toStaff.getId(),
                toStaff.getFullName(),
                audit.getReason(),
                audit.getCreatedAt()
        );
    }

    private OperationsQueueResponse.QueueColumn column(
            WashSessionStatus status,
            String label,
            Map<WashSessionStatus, List<OperationsQueueResponse.WashSessionCard>> cardsByStatus
    ) {
        return column(status.name(), label, cardsByStatus, status);
    }

    private OperationsQueueResponse.QueueColumn column(
            String status,
            String label,
            Map<WashSessionStatus, List<OperationsQueueResponse.WashSessionCard>> cardsByStatus,
            WashSessionStatus... includedStatuses
    ) {
        List<OperationsQueueResponse.WashSessionCard> sessions = java.util.Arrays.stream(includedStatuses)
                .flatMap(includedStatus -> cardsByStatus.getOrDefault(includedStatus, List.of()).stream())
                .sorted(Comparator.comparing(OperationsQueueResponse.WashSessionCard::bookingDate)
                        .thenComparing(OperationsQueueResponse.WashSessionCard::bookingTime))
                .toList();
        return new OperationsQueueResponse.QueueColumn(status, label, sessions);
    }

    private OperationsQueueResponse.WashSessionCard toQueueCard(WashSession session) {
        CustomerBooking booking = session.getBooking();
        AuthUser assignedStaff = session.getAssignedStaff();
        return new OperationsQueueResponse.WashSessionCard(
                session.getId(),
                booking.getId(),
                booking.getCustomer().getFullName(),
                booking.getCustomer().getPhone(),
                booking.getVehicle().getPlate(),
                booking.getPackageId(),
                assignedStaff == null ? null : assignedStaff.getId(),
                assignedStaff == null ? null : assignedStaff.getFullName(),
                session.getStatus().name(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getEstimatedDurationMinutes(),
                session.getFeeAmount(),
                session.getFeeCurrency(),
                session.getProjectedLoyaltyPoints(),
                session.getAwardedLoyaltyPoints(),
                session.getQueuedAt(),
                session.getCheckedInAt(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getNotes()
        );
    }

    private EligibleSessionBookingResponse toEligibleBooking(CustomerBooking booking) {
        return new EligibleSessionBookingResponse(
                booking.getId(),
                booking.getCustomer().getFullName(),
                booking.getCustomer().getPhone(),
                booking.getVehicle().getPlate(),
                booking.getPackageId(),
                booking.getComboId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getFinalAmount(),
                booking.getEstimatedDurationMinutes()
        );
    }

    private int count(List<WashSession> sessions, WashSessionStatus status) {
        return (int) sessions.stream()
                .filter(session -> session.getStatus() == status)
                .count();
    }
}
