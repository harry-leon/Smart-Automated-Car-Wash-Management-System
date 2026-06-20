package com.autowash.repository;

import com.autowash.entity.*;
import com.autowash.entity.enums.BookingOtpAuditEvent;


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
