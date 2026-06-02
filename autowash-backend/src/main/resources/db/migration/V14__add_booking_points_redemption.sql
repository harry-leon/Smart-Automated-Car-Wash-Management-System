ALTER TABLE customer_bookings
    ADD COLUMN points_redeemed INT NOT NULL DEFAULT 0;

ALTER TABLE customer_bookings
    ADD COLUMN points_discount BIGINT NOT NULL DEFAULT 0;
