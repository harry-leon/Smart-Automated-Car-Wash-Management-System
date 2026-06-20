package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_combo_usages")
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

    @Transient
    private LocalDate serviceDate;

    @Transient
    private Instant createdAt;

    protected CustomerComboUsage() {
    }

    public CustomerComboUsage(String customerComboId, String bookingId, LocalDate serviceDate) {
        this.customerComboId = UUID.fromString(customerComboId);
        this.bookingId = UUID.fromString(bookingId);
        this.serviceDate = serviceDate;
        this.usedAt = Instant.now();
        this.createdAt = this.usedAt;
    }

    @PrePersist
    void prePersist() {
        if (usedAt == null) {
            usedAt = Instant.now();
        }
    }
}
