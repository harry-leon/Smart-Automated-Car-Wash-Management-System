package com.autowash.repository;

import com.autowash.entity.BookingOtpAuditEvent;
import com.autowash.entity.BookingOtpAuditLog;
import com.autowash.entity.CustomerBooking;
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
