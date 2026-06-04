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
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER NOT NULL,
    verified BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_otp_records_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES auth_users (id)
);
