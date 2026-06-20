package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_promotions")
@IdClass(BookingPromotion.BookingPromotionId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookingPromotion {

    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Id
    @Column(name = "promotion_id", nullable = false)
    private UUID promotionId;

    @Column(name = "point_multiplier", nullable = false, precision = 4, scale = 2)
    private BigDecimal pointMultiplier;

    @Getter
    @NoArgsConstructor
    public static class BookingPromotionId implements Serializable {
        private UUID booking;
        private UUID promotionId;
    }
}
