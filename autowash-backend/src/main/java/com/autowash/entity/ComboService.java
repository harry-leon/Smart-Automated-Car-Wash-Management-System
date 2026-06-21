package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "combo_services")
@IdClass(ComboService.ComboServiceId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ComboService {

    @Id
    @Column(name = "combo_id", nullable = false)
    private UUID comboId;

    @Id
    @Column(name = "option_id", nullable = false)
    private UUID optionId;

    @Column(name = "option_name", nullable = false, length = 100)
    private String optionName;

    @Column(name = "option_description", length = 500)
    private String optionDescription;

    @Column(name = "option_price", nullable = false)
    private long optionPrice;

    @Column(name = "option_duration_minutes", nullable = false)
    private int optionDurationMinutes;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public ComboService(UUID comboId, UUID optionId, String optionName, String optionDescription,
                        long optionPrice, int optionDurationMinutes, int quantity, int sortOrder) {
        this.comboId = comboId;
        this.optionId = optionId;
        this.optionName = optionName;
        this.optionDescription = optionDescription;
        this.optionPrice = optionPrice;
        this.optionDurationMinutes = optionDurationMinutes;
        this.quantity = quantity;
        this.sortOrder = sortOrder;
    }

    @Getter
    @NoArgsConstructor
    public static class ComboServiceId implements Serializable {
        private UUID comboId;
        private UUID optionId;
    }
}
