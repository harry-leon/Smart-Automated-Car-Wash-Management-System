package com.autowash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "combo_services")
@IdClass(ComboService.ComboServiceId.class)
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

    protected ComboService() {
    }

    public UUID getComboId() { return comboId; }
    public UUID getOptionId() { return optionId; }
    public String getOptionName() { return optionName; }
    public String getOptionDescription() { return optionDescription; }
    public long getOptionPrice() { return optionPrice; }
    public int getOptionDurationMinutes() { return optionDurationMinutes; }
    public int getQuantity() { return quantity; }
    public int getSortOrder() { return sortOrder; }

    public static class ComboServiceId implements Serializable {
        private UUID comboId;
        private UUID optionId;

        public ComboServiceId() {
        }
    }
}
