CREATE TABLE auth_users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    oauth_subject VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    is_new_customer BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE auth_google_tickets (
    id UUID PRIMARY KEY,
    state VARCHAR(255) NOT NULL UNIQUE,
    return_url VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL,
    provider_subject VARCHAR(255),
    provider_email VARCHAR(255),
    provider_full_name VARCHAR(100),
    provider_avatar_url VARCHAR(500),
    user_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_auth_google_tickets_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);

CREATE TABLE otp_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    code VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER NOT NULL,
    verified BOOLEAN NOT NULL,
    invalidated_at TIMESTAMP WITH TIME ZONE,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_otp_records_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);

CREATE TABLE otp_audit_logs (
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

CREATE INDEX idx_otp_audit_logs_delivery_event_created
    ON otp_audit_logs (purpose, event_type, delivery_address, created_at);

CREATE INDEX idx_otp_audit_logs_ip_event_created
    ON otp_audit_logs (purpose, event_type, request_ip, created_at);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);
