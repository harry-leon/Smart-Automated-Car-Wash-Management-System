CREATE TABLE wash_sessions (
    id UUID PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    notes VARCHAR(500),
    fee_amount BIGINT,
    fee_currency VARCHAR(10),
    projected_loyalty_points INTEGER,
    awarded_loyalty_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    queued_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_wash_sessions_booking FOREIGN KEY (booking_id) REFERENCES customer_bookings (id)
);

CREATE INDEX idx_wash_sessions_status_created_at
    ON wash_sessions (status, created_at);
