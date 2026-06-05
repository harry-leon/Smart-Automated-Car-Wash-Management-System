ALTER TABLE customer_bookings ADD COLUMN IF NOT EXISTS confirmation_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED';
ALTER TABLE customer_bookings ADD COLUMN IF NOT EXISTS confirmation_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE customer_bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

UPDATE customer_bookings
SET confirmation_status = CASE
    WHEN status = 'CANCELLED' THEN 'CANCELLED'
    WHEN status = 'PENDING' THEN 'PENDING'
    ELSE 'VERIFIED'
END
WHERE confirmation_status IS NULL OR confirmation_status = 'VERIFIED';

CREATE TABLE IF NOT EXISTS booking_otp_challenges (
    id UUID PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    attempts INTEGER NOT NULL,
    delivery_email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    invalidated_at TIMESTAMP WITH TIME ZONE,
    locked_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_booking_otp_challenges_booking FOREIGN KEY (booking_id) REFERENCES customer_bookings (id)
);

CREATE INDEX IF NOT EXISTS idx_booking_otp_challenges_booking_status_sent
    ON booking_otp_challenges (booking_id, status, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_booking_otp_challenges_status_expires
    ON booking_otp_challenges (status, expires_at);

CREATE TABLE IF NOT EXISTS booking_otp_audit_logs (
    id UUID PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    attempt_count INTEGER NOT NULL,
    delivery_email VARCHAR(255),
    request_ip VARCHAR(64),
    user_agent VARCHAR(500),
    message VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_booking_otp_audit_logs_booking FOREIGN KEY (booking_id) REFERENCES customer_bookings (id)
);

CREATE INDEX IF NOT EXISTS idx_booking_otp_audit_logs_booking_event_created
    ON booking_otp_audit_logs (booking_id, event_type, created_at);
