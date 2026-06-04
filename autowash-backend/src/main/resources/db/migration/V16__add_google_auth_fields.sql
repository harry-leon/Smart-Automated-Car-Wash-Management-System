ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS oauth_subject VARCHAR(255);
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

UPDATE auth_users SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;
UPDATE auth_users SET email_verified = FALSE WHERE email_verified IS NULL;

ALTER TABLE auth_users ALTER COLUMN auth_provider SET NOT NULL;
ALTER TABLE auth_users ALTER COLUMN email_verified SET NOT NULL;

CREATE TABLE IF NOT EXISTS auth_google_tickets (
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
