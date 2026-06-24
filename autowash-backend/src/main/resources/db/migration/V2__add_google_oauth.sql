-- V2: Add Google OAuth support
-- 1. Allow password_hash to be NULL (users who sign up via Google have no password)
ALTER TABLE "users"
    ALTER COLUMN "password_hash" DROP NOT NULL;

-- 2. Allow phone to be NULL (Google accounts may not have a phone number at registration)
ALTER TABLE "users"
    ALTER COLUMN "phone" DROP NOT NULL;

-- 3. Create oauth_accounts table to store Google (and future providers) identity
CREATE TABLE "user_oauth_accounts" (
    "id"              uuid DEFAULT (gen_random_uuid()) PRIMARY KEY,
    "user_id"         uuid         NOT NULL,
    "provider"        varchar(30)  NOT NULL CHECK ("provider" IN ('GOOGLE', 'FACEBOOK', 'APPLE')),
    "provider_user_id" varchar(255) NOT NULL,
    "email"           varchar(255),
    "display_name"    varchar(150),
    "avatar_url"      varchar(500),
    "access_token"    text,
    "refresh_token"   text,
    "token_expires_at" timestamp with time zone,
    "created_at"      timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "updated_at"      timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP),

    -- One user can link only one account per provider
    CONSTRAINT uq_oauth_user_provider UNIQUE ("user_id", "provider"),
    -- One provider identity can only belong to one user
    CONSTRAINT uq_oauth_provider_uid UNIQUE ("provider", "provider_user_id")
);

CREATE INDEX "idx_oauth_user_id"      ON "user_oauth_accounts" ("user_id");
CREATE INDEX "idx_oauth_provider_uid" ON "user_oauth_accounts" ("provider", "provider_user_id");

ALTER TABLE "user_oauth_accounts"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
