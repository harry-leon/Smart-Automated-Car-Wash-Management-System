package com.autowash.entity;

import com.autowash.entity.enums.BookingConfirmationStatus;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.entity.enums.BookingType;
import com.autowash.entity.enums.PaymentMethod;
import com.autowash.entity.enums.PaymentStatus;
import com.autowash.entity.AuthUser;
import com.autowash.entity.CustomerVehicle;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class CustomerBooking {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private CustomerVehicle vehicle;

    @Transient
    private AuthUser assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false, length = 20)
    private BookingType bookingType;

    @Column(name = "package_id")
    private UUID packageId;

    @Column(name = "combo_id")
    private UUID comboId;

    @Column(name = "voucher_id")
    private UUID voucherId;

    @Transient
    private String voucherCode;

    @Transient
    private LocalDate bookingDate;

    @Transient
    private LocalTime bookingTime;

    @Transient
    private PaymentMethod paymentMethod;

    @Transient
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status;

    @Transient
    private BookingConfirmationStatus confirmationStatus;

    @Transient
    private Instant confirmationExpiresAt;

    @Transient
    private Instant confirmedAt;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "base_amount", nullable = false)
    private long basePrice;

    @Column(name = "options_amount", nullable = false)
    private long addonsTotal;

    @Column(name = "discount_amount", nullable = false)
    private long voucherDiscount;

    @Column(name = "points_redeemed", nullable = false)
    private int pointsRedeemed;

    @Column(name = "points_discount", nullable = false)
    private long pointsDiscount;

    @Column(name = "final_amount", nullable = false)
    private long finalAmount;

    @Column(name = "estimated_duration_minutes", nullable = false)
    private int estimatedDurationMinutes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Transient
    private Instant cancelledAt;

    @Transient
    private Long refundAmount;

    @Transient
    private String refundStatus;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Transient
    private List<BookingAddon> addons = new ArrayList<>();

    protected CustomerBooking() {
    }

    public CustomerBooking(
            String id,
            AuthUser customer,
            CustomerVehicle vehicle,
            String packageId,
            String comboId,
            String voucherCode,
            LocalDate bookingDate,
            LocalTime bookingTime,
            PaymentMethod paymentMethod,
            long basePrice,
            long addonsTotal,
            long voucherDiscount,
            long finalAmount,
            int estimatedDurationMinutes
    ) {
        this.id = parseUuidOrNew(id);
        this.customer = customer;
        this.vehicle = vehicle;
        this.packageId = parseUuid(packageId);
        this.comboId = parseUuid(comboId);
        this.bookingType = this.packageId == null ? BookingType.COMBO : BookingType.PACKAGE;
        this.voucherCode = voucherCode;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.scheduledAt = LocalDateTime.of(bookingDate, bookingTime).atZone(ZoneId.systemDefault()).toInstant();
        this.paymentMethod = paymentMethod;
        this.paymentStatus = PaymentStatus.PAID;
        this.status = BookingStatus.PENDING;
        this.confirmationStatus = BookingConfirmationStatus.PENDING;
        this.basePrice = basePrice;
        this.addonsTotal = addonsTotal;
        this.voucherDiscount = voucherDiscount;
        this.pointsRedeemed = 0;
        this.pointsDiscount = 0;
        this.finalAmount = finalAmount;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id == null ? null : id.toString(); }
    public UUID getIdValue() { return id; }
    public AuthUser getCustomer() { return customer; }
    public CustomerVehicle getVehicle() { return vehicle; }
    public AuthUser getAssignedStaff() { return assignedStaff; }
    public BookingType getBookingType() { return bookingType; }
    public String getPackageId() { return packageId == null ? null : packageId.toString(); }
    public UUID getPackageIdValue() { return packageId; }
    public String getComboId() { return comboId == null ? null : comboId.toString(); }
    public UUID getComboIdValue() { return comboId; }
    public UUID getVoucherId() { return voucherId; }
    public String getVoucherCode() { return voucherCode; }
    public LocalDate getBookingDate() { return scheduledAt.atZone(ZoneId.systemDefault()).toLocalDate(); }
    public LocalTime getBookingTime() { return scheduledAt.atZone(ZoneId.systemDefault()).toLocalTime(); }
    public Instant getScheduledAt() { return scheduledAt; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public BookingStatus getStatus() { return status; }
    public BookingConfirmationStatus getConfirmationStatus() { return confirmationStatus; }
    public Instant getConfirmationExpiresAt() { return confirmationExpiresAt; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public long getBasePrice() { return basePrice; }
    public long getAddonsTotal() { return addonsTotal; }
    public long getVoucherDiscount() { return voucherDiscount; }
    public int getPointsRedeemed() { return pointsRedeemed; }
    public long getPointsDiscount() { return pointsDiscount; }
    public long getFinalAmount() { return finalAmount; }
    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public Long getRefundAmount() { return refundAmount; }
    public String getRefundStatus() { return refundStatus; }
    public String getCancelReason() { return cancelReason; }
    public List<BookingAddon> getAddons() { return addons; }

    public void addAddon(BookingAddon addon) {
        addons.add(addon);
    }

    public void cancel(String reason) {
        this.status = BookingStatus.CANCELLED;
        if (this.confirmationStatus != BookingConfirmationStatus.EXPIRED) {
            this.confirmationStatus = BookingConfirmationStatus.CANCELLED;
        }
        this.cancelledAt = Instant.now();
        this.refundAmount = finalAmount;
        this.refundStatus = "INITIATED";
        this.cancelReason = reason;
    }

    public void startOtpConfirmationWindow(Instant expiresAt) {
        this.confirmationStatus = BookingConfirmationStatus.PENDING;
        this.confirmationExpiresAt = expiresAt;
    }

    public void confirmByOtp() {
        this.status = BookingStatus.CONFIRMED;
        this.confirmationStatus = BookingConfirmationStatus.VERIFIED;
        this.confirmedAt = Instant.now();
    }

    public void expireOtpConfirmation() {
        this.confirmationStatus = BookingConfirmationStatus.EXPIRED;
        cancel("Booking OTP verification expired");
    }

    public void updateStatus(BookingStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void assignStaff(AuthUser assignedStaff) {
        this.assignedStaff = assignedStaff;
    }

    public void applyPoints(int points, long discountAmount) {
        this.pointsRedeemed = points;
        this.pointsDiscount = discountAmount;
        this.finalAmount = Math.max(0, finalAmount - discountAmount);
        this.updatedAt = Instant.now();
    }

    private static UUID parseUuid(String value) {
        try {
            return value == null || value.isBlank() ? null : UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static UUID parseUuidOrNew(String value) {
        UUID parsed = parseUuid(value);
        return parsed == null ? UUID.randomUUID() : parsed;
    }
}
