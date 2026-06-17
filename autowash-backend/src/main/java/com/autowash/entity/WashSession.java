package com.autowash.entity;

import com.autowash.enums.WashSessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wash_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WashSession {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private CustomerBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private AuthUser assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WashSessionStatus status;

    @Column(name = "fee_amount")
    private Long feeAmount;

    @Column(name = "projected_points")
    private Integer projectedPoints;

    @Column(name = "awarded_points")
    private Integer awardedPoints;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
