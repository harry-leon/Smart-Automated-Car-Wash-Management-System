package com.autowash.booking.entity;

import com.autowash.auth.entity.AuthUser;
import com.autowash.vehicle.entity.CustomerVehicle;
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
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_bookings")
public class CustomerBooking {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AuthUser customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private CustomerVehicle vehicle;

    @Column(name = "package_id", length = 50)
    private String packageId;

    @Column(name = "combo_id", length = 50)
    private String comboId;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_time", nullable = false)
    private LocalTime bookingTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status;

    @Column(name = "base_price", nullable = false)
    private long basePrice;

    @Column(name = "addons_total", nullable = false)
    private long addonsTotal;

    @Column(name = "voucher_discount", nullable = false)
    private long voucherDiscount;

    @Column(name = "final_amount", nullable = false)
    private long finalAmount;

    @Column(name = "estimated_duration_minutes", nullable = false)
    private int estimatedDurationMinutes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "refund_amount")
    private Long refundAmount;

    @Column(name = "refund_status", length = 30)
    private String refundStatus;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("addonId ASC")
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
        this.id = id;
        this.customer = customer;
        this.vehicle = vehicle;
        this.packageId = packageId;
        this.comboId = comboId;
        this.voucherCode = voucherCode;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = PaymentStatus.CONFIRMED;
        this.status = BookingStatus.CONFIRMED;
        this.basePrice = basePrice;
        this.addonsTotal = addonsTotal;
        this.voucherDiscount = voucherDiscount;
        this.finalAmount = finalAmount;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public AuthUser getCustomer() { return customer; }
    public CustomerVehicle getVehicle() { return vehicle; }
    public String getPackageId() { return packageId; }
    public String getComboId() { return comboId; }
    public String getVoucherCode() { return voucherCode; }
    public LocalDate getBookingDate() { return bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public BookingStatus getStatus() { return status; }
    public long getBasePrice() { return basePrice; }
    public long getAddonsTotal() { return addonsTotal; }
    public long getVoucherDiscount() { return voucherDiscount; }
    public long getFinalAmount() { return finalAmount; }
    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public Instant getCreatedAt() { return createdAt; }
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
        this.cancelledAt = Instant.now();
        this.refundAmount = finalAmount;
        this.refundStatus = "INITIATED";
        this.cancelReason = reason;
    }

    public void updateStatus(BookingStatus status) {
        this.status = status;
    }
}
