package com.autowash.repository;

import com.autowash.entity.User;
import com.autowash.entity.enums.OtpPurpose;
import com.autowash.entity.OtpVerification;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findFirstByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNullOrderByCreatedAtDesc(User user, OtpPurpose purpose);

    List<OtpVerification> findByUserAndPurposeAndVerifiedFalseAndInvalidatedAtIsNull(User user, OtpPurpose purpose);

    long countByUserAndPurposeAndCreatedAtAfter(User user, OtpPurpose purpose, Instant createdAt);
}

