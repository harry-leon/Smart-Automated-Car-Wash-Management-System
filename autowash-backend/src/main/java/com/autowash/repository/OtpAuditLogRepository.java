package com.autowash.repository;

import com.autowash.entity.*;
import com.autowash.entity.enums.OtpAuditEvent;

import com.autowash.entity.enums.OtpPurpose;
import java.time.Instant;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpAuditLogRepository extends JpaRepository<OtpAuditLog, UUID> {

    long countByPurposeAndEventTypeInAndDeliveryAddressIgnoreCaseAndCreatedAtAfter(
            OtpPurpose purpose,
            Collection<OtpAuditEvent> eventTypes,
            String deliveryAddress,
            Instant createdAt
    );

    long countByPurposeAndEventTypeInAndRequestIpAndCreatedAtAfter(
            OtpPurpose purpose,
            Collection<OtpAuditEvent> eventTypes,
            String requestIp,
            Instant createdAt
    );

    long countByPurposeAndEventTypeInAndDeviceFingerprintAndCreatedAtAfter(
            OtpPurpose purpose,
            Collection<OtpAuditEvent> eventTypes,
            String deviceFingerprint,
            Instant createdAt
    );
}
