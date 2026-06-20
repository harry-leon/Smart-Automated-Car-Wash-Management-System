package com.autowash.repository;


import com.autowash.entity.*;
import com.autowash.entity.enums.OtpPurpose;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRecordRepository extends JpaRepository<OtpRecord, UUID> {

    Optional<OtpRecord> findFirstByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNullOrderByCreatedAtDesc(AuthUser user, OtpPurpose purpose);

    List<OtpRecord> findByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNull(AuthUser user, OtpPurpose purpose);

    long countByUserAndPurposeAndCreatedAtAfter(AuthUser user, OtpPurpose purpose, Instant createdAt);
}
