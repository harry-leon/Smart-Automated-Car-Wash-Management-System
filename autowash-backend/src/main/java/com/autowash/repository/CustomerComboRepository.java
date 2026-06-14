package com.autowash.repository;

import com.autowash.entity.CustomerCombo;
import com.autowash.entity.CustomerComboStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerComboRepository extends JpaRepository<CustomerCombo, String> {
    Optional<CustomerCombo> findFirstByCustomer_IdAndComboIdAndStatusOrderByCreatedAtDesc(
            java.util.UUID customerId,
            String comboId,
            CustomerComboStatus status
    );

    List<CustomerCombo> findByCustomer_IdAndStatusAndExpiresAtAfter(
            java.util.UUID customerId,
            CustomerComboStatus status,
            Instant now
    );
}
