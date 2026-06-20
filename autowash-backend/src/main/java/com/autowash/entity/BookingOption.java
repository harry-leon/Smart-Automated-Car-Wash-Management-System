package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_options")
@IdClass(BookingOption.BookingOptionId.class)
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookingOption {

    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private CustomerBooking booking;

    @Id
    @Column(name = "option_id", nullable = false)
    private UUID optionId;

    @Column(name = "option_name", nullable = false, length = 100)
    private String optionName;

    @Column(name = "option_price", nullable = false)
    private long optionPrice;

    @Getter
    @NoArgsConstructor
    public static class BookingOptionId implements Serializable {
        private UUID booking;
        private UUID optionId;
    }
}
