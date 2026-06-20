package com.autowash.entity;

import java.util.UUID;

public class BookingAddon {

    private UUID id;

    private CustomerBooking booking;

    private String addonId;

    private String addonName;

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
