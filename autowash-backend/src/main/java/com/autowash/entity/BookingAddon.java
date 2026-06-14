package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "booking_addons")
public class BookingAddon {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @Column(name = "addon_id", nullable = false, length = 50)
    private String addonId;

    @Column(name = "addon_name", nullable = false, length = 100)
    private String addonName;

    @Column(name = "addon_price", nullable = false)
    private long addonPrice;

    protected BookingAddon() {
    }

    public BookingAddon(CustomerBooking booking, String addonId, String addonName, long addonPrice) {
        this.id = UUID.randomUUID();
        this.booking = booking;
        this.addonId = addonId;
        this.addonName = addonName;
        this.addonPrice = addonPrice;
    }

    public String getAddonId() { return addonId; }
    public String getAddonName() { return addonName; }
    public long getAddonPrice() { return addonPrice; }
}
