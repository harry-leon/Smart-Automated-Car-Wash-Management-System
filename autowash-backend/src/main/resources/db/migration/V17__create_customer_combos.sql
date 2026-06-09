CREATE TABLE customer_combos (
    id VARCHAR(50) PRIMARY KEY,
    customer_id UUID NOT NULL,
    combo_id VARCHAR(50) NOT NULL,
    purchase_booking_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_usages INTEGER NOT NULL,
    remaining_usages INTEGER NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_customer_combos_customer FOREIGN KEY (customer_id) REFERENCES auth_users (id),
    CONSTRAINT fk_customer_combos_combo FOREIGN KEY (combo_id) REFERENCES service_combos (id),
    CONSTRAINT fk_customer_combos_booking FOREIGN KEY (purchase_booking_id) REFERENCES customer_bookings (id)
);

CREATE TABLE customer_combo_usages (
    id UUID PRIMARY KEY,
    customer_combo_id VARCHAR(50) NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NOT NULL,
    service_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_customer_combo_usages_customer_combo FOREIGN KEY (customer_combo_id) REFERENCES customer_combos (id),
    CONSTRAINT fk_customer_combo_usages_booking FOREIGN KEY (booking_id) REFERENCES customer_bookings (id)
);

CREATE INDEX idx_customer_combos_customer_combo_status_expiry
    ON customer_combos (customer_id, combo_id, status, expires_at);

CREATE INDEX idx_customer_combo_usages_customer_combo
    ON customer_combo_usages (customer_combo_id);
