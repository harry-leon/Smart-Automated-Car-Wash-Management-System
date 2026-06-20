package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "booking_options")
@IdClass(BookingOption.BookingOptionId.class)
public class BookingOption {

    @Id
    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Id
    @Column(name = "option_id", nullable = false)
    private UUID optionId;

    @Column(name = "option_name", nullable = false, length = 100)
    private String optionName;

    @Column(name = "option_price", nullable = false)
    private long optionPrice;

    protected BookingOption() {
    }

    public BookingOption(UUID bookingId, UUID optionId, String optionName, long optionPrice) {
        this.bookingId = bookingId;
        this.optionId = optionId;
        this.optionName = optionName;
        this.optionPrice = optionPrice;
    }

    public UUID getBookingId() { return bookingId; }
    public UUID getOptionId() { return optionId; }
    public String getOptionName() { return optionName; }
    public long getOptionPrice() { return optionPrice; }

    public static class BookingOptionId implements Serializable {
        private UUID bookingId;
        private UUID optionId;

        public BookingOptionId() {
        }
    }
}
