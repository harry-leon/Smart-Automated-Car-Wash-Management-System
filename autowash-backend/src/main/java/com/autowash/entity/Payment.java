package com.autowash.entity;

import com.autowash.entity.enums.PaymentMethod;
import com.autowash.entity.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "method", nullable = false, columnDefinition = "payment_method")
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "payment_status")
    private PaymentStatus status;

    @Column(nullable = false)
    private long amount;

    @Column(name = "transaction_ref", length = 120)
    private String transactionRef;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Payment(Booking booking, PaymentMethod method, PaymentStatus status, long amount) {
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.method = method;
        this.status = status;
        this.amount = amount;
        this.createdAt = Instant.now();
    }

    public void updateAmount(long amount) {
        this.amount = amount;
    }

    public void markPaid(String transactionRef) {
        if (this.status == PaymentStatus.PAID) {
            return;
        }
        this.status = PaymentStatus.PAID;
        this.transactionRef = transactionRef;
        this.paidAt = Instant.now();
    }
}
