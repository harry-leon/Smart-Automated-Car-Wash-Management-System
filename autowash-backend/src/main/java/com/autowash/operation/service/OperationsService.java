package com.autowash.operation.service;

import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.service.BookingService;
import com.autowash.operation.dto.CheckInWashSessionResponse;
import com.autowash.operation.dto.CompleteWashSessionResponse;
import com.autowash.operation.dto.CreateWashSessionRequest;
import com.autowash.operation.dto.CreateWashSessionResponse;
import com.autowash.operation.dto.QueueWashSessionResponse;
import com.autowash.operation.dto.StartWashSessionResponse;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.entity.WashSessionStatus;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.auth.entity.AuthUser;
import com.autowash.shared.exception.ApiException;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationsService {

    private static final Set<WashSessionStatus> ACTIVE_SESSION_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.QUEUED,
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS
    );

    private final BookingService bookingService;
    private final WashSessionRepository washSessionRepository;
    private final LoyaltyPointService loyaltyPointService;
    private final String currency;

    public OperationsService(
            BookingService bookingService,
            WashSessionRepository washSessionRepository,
            LoyaltyPointService loyaltyPointService,
            @Value("${autowash.currency}") String currency
    ) {
        this.bookingService = bookingService;
        this.washSessionRepository = washSessionRepository;
        this.loyaltyPointService = loyaltyPointService;
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

        WashSession session = washSessionRepository.save(new WashSession(booking, request.notes()));
        bookingService.updateStatus(booking, BookingStatus.SESSION_CREATED);
        return new CreateWashSessionResponse(
                session.getId(),
                session.getStatus().name(),
                booking.getId(),
                session.getCreatedAt()
        );
    }

    @Transactional
    public QueueWashSessionResponse queueSession(UUID sessionId) {
        WashSession session = requireSession(sessionId);
        Instant queuedAt = Instant.now();
        session.queue(queuedAt);
        return new QueueWashSessionResponse(session.getId(), session.getStatus().name(), session.getQueuedAt());
    }

    @Transactional
    public CheckInWashSessionResponse checkInSession(UUID sessionId) {
        WashSession session = requireSession(sessionId);
        CustomerBooking booking = session.getBooking();
        int projectedPoints = loyaltyPointService.calculateProjectedPoints(
                booking.getFinalAmount(),
                booking.getCustomer().getTier()
        );

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
        WashSession session = requireSession(sessionId);
        Instant startedAt = Instant.now();
        session.start(startedAt);
        bookingService.updateStatus(session.getBooking(), BookingStatus.IN_PROGRESS);
        return new StartWashSessionResponse(session.getId(), session.getStatus().name(), session.getStartedAt());
    }

    @Transactional
    public CompleteWashSessionResponse completeSession(UUID sessionId) {
        WashSession session = requireSession(sessionId);
        int awardedPoints = loyaltyPointService.awardPoints(session.getProjectedLoyaltyPoints() == null ? 0 : session.getProjectedLoyaltyPoints());

        Instant completedAt = Instant.now();
        session.complete(completedAt, awardedPoints);
        bookingService.updateStatus(session.getBooking(), BookingStatus.COMPLETED);
        markCustomerAsNotNew(session.getBooking().getCustomer());
        return new CompleteWashSessionResponse(
                session.getId(),
                session.getStatus().name(),
                session.getCompletedAt(),
                session.getAwardedLoyaltyPoints()
        );
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
}
