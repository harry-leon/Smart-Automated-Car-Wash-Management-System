package com.autowash.auth.repository;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.OtpPurpose;
import com.autowash.auth.entity.OtpRecord;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRecordRepository extends JpaRepository<OtpRecord, UUID> {

    Optional<OtpRecord> findFirstByUserAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(AuthUser user, OtpPurpose purpose);
}
