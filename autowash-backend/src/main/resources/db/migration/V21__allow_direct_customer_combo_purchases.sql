ALTER TABLE customer_combos
    ALTER COLUMN purchase_booking_id DROP NOT NULL;

ALTER TABLE customer_combos
    DROP CONSTRAINT fk_customer_combos_booking;
