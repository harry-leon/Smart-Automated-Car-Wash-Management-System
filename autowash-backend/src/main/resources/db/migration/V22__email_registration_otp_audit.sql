ALTER TABLE otp_records ALTER COLUMN code TYPE VARCHAR(255);
ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255);
UPDATE otp_records
SET delivery_address = COALESCE((
    SELECT auth_users.email
    FROM auth_users
    WHERE auth_users.id = otp_records.user_id
), 'unknown@example.local')
WHERE delivery_address IS NULL;
ALTER TABLE otp_records ALTER COLUMN delivery_address SET NOT NULL;
ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS otp_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    purpose VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    delivery_address VARCHAR(255),
    attempt_count INTEGER NOT NULL,
    request_ip VARCHAR(64),
    user_agent VARCHAR(500),
    device_fingerprint VARCHAR(255),
    message VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_otp_audit_logs_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);

CREATE INDEX IF NOT EXISTS idx_otp_audit_logs_delivery_event_created
    ON otp_audit_logs (purpose, event_type, delivery_address, created_at);

CREATE INDEX IF NOT EXISTS idx_otp_audit_logs_ip_event_created
    ON otp_audit_logs (purpose, event_type, request_ip, created_at);
