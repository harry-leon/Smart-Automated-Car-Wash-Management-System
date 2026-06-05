package com.autowash.booking.repository;

import com.autowash.booking.entity.BookingOtpAuditEvent;
import com.autowash.booking.entity.BookingOtpAuditLog;
import com.autowash.booking.entity.CustomerBooking;
import java.time.Instant;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingOtpAuditLogRepository extends JpaRepository<BookingOtpAuditLog, UUID> {

    long countByBookingAndEventTypeInAndCreatedAtAfter(
            CustomerBooking booking,
            Collection<BookingOtpAuditEvent> eventTypes,
            Instant createdAt
    );
}
