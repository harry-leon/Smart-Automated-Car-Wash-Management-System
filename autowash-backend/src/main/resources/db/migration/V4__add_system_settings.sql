-- System settings: single-row table (id is always 1)
CREATE TABLE "system_settings" (
    "id" int PRIMARY KEY,

    "operating_start_time" varchar(5) NOT NULL DEFAULT '08:00',
    "operating_end_time" varchar(5) NOT NULL DEFAULT '20:00',

    "max_advance_booking_days" int NOT NULL DEFAULT 30,
    "no_show_grace_minutes" int NOT NULL DEFAULT 15,

    "currency" varchar(10) NOT NULL DEFAULT 'VND',

    "earn_points_unit_amount" int NOT NULL DEFAULT 10000,
    "vnd_per_point" int NOT NULL DEFAULT 1000,
    "min_redemption_points" int NOT NULL DEFAULT 50,
    "max_redemption_points" int NOT NULL DEFAULT 200,

    "silver_threshold" int NOT NULL DEFAULT 500,
    "gold_threshold" int NOT NULL DEFAULT 1500,
    "platinum_threshold" int NOT NULL DEFAULT 4000,

    "silver_multiplier" numeric(4,2) NOT NULL DEFAULT 1.2,
    "gold_multiplier" numeric(4,2) NOT NULL DEFAULT 1.5,
    "platinum_multiplier" numeric(4,2) NOT NULL DEFAULT 2.0,

    "updated_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed with defaults
INSERT INTO "system_settings" ("id") VALUES (1);
