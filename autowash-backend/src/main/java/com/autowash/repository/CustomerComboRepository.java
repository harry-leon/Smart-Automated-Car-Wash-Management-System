package com.autowash.repository;

import com.autowash.entity.CustomerCombo;
import com.autowash.enums.CustomerComboStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerComboRepository extends JpaRepository<CustomerCombo, UUID> {
    Optional<CustomerCombo> findFirstByCustomer_IdAndComboIdAndStatusOrderByCreatedAtDesc(
            java.util.UUID customerId,
            java.util.UUID comboId,
            CustomerComboStatus status
    );

    List<CustomerCombo> findByCustomer_IdAndStatusAndExpiresAtAfter(
            java.util.UUID customerId,
            CustomerComboStatus status,
            Instant now
    );
}
