package com.autowash.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_combo_usages")
public class CustomerComboUsage {

    @Id
    private UUID id;

    @Column(name = "customer_combo_id", nullable = false, length = 50)
    private String customerComboId;

    @Column(name = "booking_id", nullable = false, length = 50)
    private String bookingId;

    @Column(name = "used_at", nullable = false)
    private Instant usedAt;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CustomerComboUsage() {
    }

    public CustomerComboUsage(String customerComboId, String bookingId, LocalDate serviceDate) {
        this.id = UUID.randomUUID();
        this.customerComboId = customerComboId;
        this.bookingId = bookingId;
        this.serviceDate = serviceDate;
        this.usedAt = Instant.now();
        this.createdAt = this.usedAt;
    }
}
