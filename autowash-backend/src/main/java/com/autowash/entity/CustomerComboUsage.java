package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_combo_usages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerComboUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_combo_id", nullable = false)
    private UUID customerComboId;

    @Column(name = "booking_id", nullable = false, unique = true)
    private UUID bookingId;

    @Column(name = "used_at", nullable = false)
    private Instant usedAt;

    public CustomerComboUsage(UUID customerComboId, UUID bookingId) {
        this.customerComboId = customerComboId;
        this.bookingId = bookingId;
        this.usedAt = Instant.now();
    }
}
