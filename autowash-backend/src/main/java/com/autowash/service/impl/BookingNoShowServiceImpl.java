package com.autowash.service.impl;

import com.autowash.entity.Booking;
import com.autowash.entity.BookingStatusHistory;
import com.autowash.entity.WashSession;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.BookingRepository;
import com.autowash.repository.BookingStatusHistoryRepository;
import com.autowash.repository.WashSessionRepository;
import com.autowash.service.BookingNoShowService;
import com.autowash.service.WashSessionLifecycle;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingNoShowServiceImpl implements BookingNoShowService {

    private static final Set<WashSessionStatus> CHECKED_IN_OR_BETTER = Set.of(
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS,
            WashSessionStatus.COMPLETED
    );
    private static final Set<WashSessionStatus> NOT_CHECKED_IN_SESSION_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.QUEUED
    );

    private final BookingRepository bookingRepository;
    private final WashSessionRepository washSessionRepository;
    private final BookingStatusHistoryRepository bookingStatusHistoryRepository;
    private final long noShowGraceMinutes;

    public BookingNoShowServiceImpl(
            BookingRepository bookingRepository,
            WashSessionRepository washSessionRepository,
            BookingStatusHistoryRepository bookingStatusHistoryRepository,
            @Value("${autowash.booking.no-show.grace-minutes:15}") long noShowGraceMinutes
    ) {
        this.bookingRepository = bookingRepository;
        this.washSessionRepository = washSessionRepository;
        this.bookingStatusHistoryRepository = bookingStatusHistoryRepository;
        this.noShowGraceMinutes = noShowGraceMinutes;
    }

    @Override
    @Transactional
    @Scheduled(
            fixedDelayString = "${autowash.booking.no-show.scan-delay-ms:60000}",
            initialDelayString = "${autowash.booking.no-show.initial-delay-ms:60000}"
    )
    public int markOverdueBookingsNoShow() {
        Instant now = Instant.now();
        Instant cutoff = now.minusSeconds(noShowGraceMinutes * 60);
        List<Booking> bookings = bookingRepository.findNoShowCandidates(
                BookingStatus.CONFIRMED,
                cutoff,
                CHECKED_IN_OR_BETTER
        );

        for (Booking booking : bookings) {
            BookingStatus oldStatus = booking.getStatus();
            booking.markNoShow();
            cancelNotCheckedInSessions(booking, now);
            bookingStatusHistoryRepository.save(new BookingStatusHistory(
                    booking,
                    oldStatus.name(),
                    BookingStatus.NO_SHOW.name(),
                    null,
                    "Customer did not check in within " + noShowGraceMinutes + " minutes"
            ));
        }
        return bookings.size();
    }

    private void cancelNotCheckedInSessions(Booking booking, Instant cancelledAt) {
        List<WashSession> sessions = washSessionRepository.findByBooking_IdAndStatusIn(
                booking.getId(),
                NOT_CHECKED_IN_SESSION_STATUSES
        );
        for (WashSession session : sessions) {
            WashSessionLifecycle.validateTransition(session.getStatus(), WashSessionStatus.CANCELLED);
            session.cancel(cancelledAt, "Booking marked NO_SHOW before check-in");
        }
    }
}
