package com.autowash.auth.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.OtpPurpose;
import com.autowash.auth.entity.OtpRecord;
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
