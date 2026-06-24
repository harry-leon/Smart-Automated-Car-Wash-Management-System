-- V3: Google OAuth ticket table
-- Stores short-lived state tickets used during the Google OAuth callback flow.
-- The frontend polls this table via state key to know when auth is ready.

CREATE TABLE "google_auth_tickets" (
    "state"              varchar(255) PRIMARY KEY,
    "status"             varchar(30)  NOT NULL DEFAULT 'PENDING'
                             CHECK ("status" IN ('PENDING', 'LINK_REQUIRED', 'READY', 'CONSUMED', 'EXPIRED')),
    "provider_email"     varchar(255),
    "provider_full_name" varchar(150),
    "provider_avatar_url" varchar(500),
    "provider_subject"   varchar(255),
    "return_url"         varchar(1000) NOT NULL,
    "user_id"            uuid,
    "link_required"      boolean NOT NULL DEFAULT false,
    "expires_at"         timestamp with time zone NOT NULL,
    "created_at"         timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX "idx_google_tickets_state"   ON "google_auth_tickets" ("state");
CREATE INDEX "idx_google_tickets_user_id" ON "google_auth_tickets" ("user_id");
CREATE INDEX "idx_google_tickets_expires" ON "google_auth_tickets" ("expires_at");
