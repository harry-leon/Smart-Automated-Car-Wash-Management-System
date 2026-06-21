CREATE TYPE "user_role" AS ENUM (
  'CUSTOMER',
  'STAFF',
  'ADMIN'
);

CREATE TYPE "user_account_status" AS ENUM (
  'PENDING',
  'PENDING_VERIFY',
  'ACTIVE',
  'BLOCKED',
  'SUSPENDED',
  'INACTIVE',
  'DELETED'
);

CREATE TYPE "vehicle_status" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'DELETED'
);

CREATE TYPE "active_status" AS ENUM (
  'ACTIVE',
  'INACTIVE'
);

CREATE TYPE "discount_type" AS ENUM (
  'PERCENT',
  'FIXED_AMOUNT'
);

CREATE TYPE "loyalty_tier" AS ENUM (
  'MEMBER',
  'SILVER',
  'GOLD',
  'PLATINUM'
);

CREATE TYPE "promotion_targeting_mode" AS ENUM (
  'ALL_TIERS',
  'SPECIFIC_TIERS'
);

CREATE TYPE "booking_type" AS ENUM (
  'PACKAGE',
  'COMBO'
);

CREATE TYPE "booking_status" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TYPE "payment_method" AS ENUM (
  'CASH_AT_COUNTER',
  'BANK_TRANSFER',
  'E_WALLET'
);

CREATE TYPE "payment_status" AS ENUM (
  'UNPAID',
  'PENDING_PAYMENT',
  'PAID',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE "wash_session_status" AS ENUM (
  'PENDING',
  'QUEUED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "point_transaction_type" AS ENUM (
  'EARN',
  'REDEEM',
  'EXPIRE',
  'ADJUST'
);

CREATE TYPE "customer_combo_status" AS ENUM (
  'ACTIVE',
  'EXPIRED',
  'USED_UP',
  'CANCELLED'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "full_name" varchar(100) NOT NULL,
  "phone" varchar(20) UNIQUE NOT NULL,
  "email" varchar(255) UNIQUE,
  "password_hash" varchar(255) NOT NULL,
  "role" user_role NOT NULL,
  "status" user_account_status NOT NULL DEFAULT 'ACTIVE',
  "avatar_url" varchar(500),
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_preferences" (
  "user_id" uuid PRIMARY KEY,
  "language" varchar(10) NOT NULL DEFAULT 'VI',
  "theme" varchar(20) NOT NULL DEFAULT 'LIGHT',
  "notifications_enabled" boolean NOT NULL DEFAULT true,
  "email_notifications" boolean NOT NULL DEFAULT false,
  "sms_notifications" boolean NOT NULL DEFAULT true
);

CREATE TABLE "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "token" varchar(255) UNIQUE NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "otp_verifications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid,
  "purpose" varchar(50) NOT NULL,
  "code_hash" varchar(255) NOT NULL,
  "delivery_address" varchar(255) NOT NULL,
  "attempts" int NOT NULL DEFAULT 0,
  "expires_at" timestamptz NOT NULL,
  "verified_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "vehicles" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "plate" varchar(20) UNIQUE NOT NULL,
  "type" varchar(30) NOT NULL,
  "brand" varchar(50) NOT NULL,
  "model" varchar(50) NOT NULL,
  "vehicle_year" int,
  "color" varchar(30),
  "is_primary" boolean NOT NULL DEFAULT false,
  "status" vehicle_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "packages" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) NOT NULL,
  "description" varchar(500),
  "base_price" bigint NOT NULL,
  "duration_minutes" int NOT NULL,
  "image_url" varchar(500),
  "status" active_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "services" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) NOT NULL,
  "description" varchar(500),
  "price" bigint NOT NULL,
  "duration_minutes" int NOT NULL,
  "status" active_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "package_services" (
  "package_id" uuid NOT NULL,
  "option_id" uuid NOT NULL,
  "option_name" varchar(100) NOT NULL,
  "option_description" varchar(500),
  "option_price" bigint NOT NULL,
  "option_duration_minutes" int NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "sort_order" int NOT NULL DEFAULT 0,
  PRIMARY KEY ("package_id", "option_id")
);

CREATE TABLE "combos" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) NOT NULL,
  "description" varchar(500),
  "price" bigint NOT NULL,
  "original_price" bigint,
  "duration_minutes" int NOT NULL,
  "duration_days" int,
  "max_usages" int,
  "image_url" varchar(500),
  "status" active_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "combo_services" (
  "combo_id" uuid NOT NULL,
  "option_id" uuid NOT NULL,
  "option_name" varchar(100) NOT NULL,
  "option_description" varchar(500),
  "option_price" bigint NOT NULL,
  "option_duration_minutes" int NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "sort_order" int NOT NULL DEFAULT 0,
  PRIMARY KEY ("combo_id", "option_id")
);

CREATE TABLE "vouchers" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(120) NOT NULL,
  "discount_type" discount_type NOT NULL,
  "discount_value" bigint NOT NULL,
  "min_order_amount" bigint NOT NULL DEFAULT 0,
  "max_discount_amount" bigint,
  "usage_limit" int,
  "used_count" int NOT NULL DEFAULT 0,
  "new_customer_only" boolean NOT NULL DEFAULT false,
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "status" active_status NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE "voucher_tiers" (
  "voucher_id" uuid NOT NULL,
  "tier" loyalty_tier NOT NULL,
  PRIMARY KEY ("voucher_id", "tier")
);

CREATE TABLE "promotions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(120) NOT NULL,
  "description" varchar(500),
  "point_multiplier" numeric(4,2) NOT NULL DEFAULT 1,
  "targeting_mode" promotion_targeting_mode NOT NULL DEFAULT 'ALL_TIERS',
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "status" active_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "promotion_tiers" (
  "promotion_id" uuid NOT NULL,
  "tier" loyalty_tier NOT NULL,
  PRIMARY KEY ("promotion_id", "tier")
);

CREATE TABLE "bookings" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "vehicle_id" uuid NOT NULL,
  "booking_type" booking_type NOT NULL,
  "package_id" uuid,
  "combo_id" uuid,
  "voucher_id" uuid,
  "status" booking_status NOT NULL DEFAULT 'PENDING',
  "scheduled_at" timestamptz NOT NULL,
  "base_amount" bigint NOT NULL DEFAULT 0,
  "options_amount" bigint NOT NULL DEFAULT 0,
  "discount_amount" bigint NOT NULL DEFAULT 0,
  "final_amount" bigint NOT NULL DEFAULT 0,
  "estimated_duration_minutes" int NOT NULL DEFAULT 0,
  "points_redeemed" int NOT NULL DEFAULT 0,
  "points_discount" bigint NOT NULL DEFAULT 0,
  "note" text,
  "cancel_reason" varchar(500),
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "booking_options" (
  "booking_id" uuid NOT NULL,
  "option_id" uuid NOT NULL,
  "option_name" varchar(100) NOT NULL,
  "option_price" bigint NOT NULL,
  PRIMARY KEY ("booking_id", "option_id")
);

CREATE TABLE "booking_promotions" (
  "booking_id" uuid NOT NULL,
  "promotion_id" uuid NOT NULL,
  "point_multiplier" numeric(4,2) NOT NULL,
  PRIMARY KEY ("booking_id", "promotion_id")
);

CREATE TABLE "booking_status_histories" (
  "id" BIGSERIAL PRIMARY KEY,
  "booking_id" uuid NOT NULL,
  "old_status" varchar(30),
  "new_status" varchar(30) NOT NULL,
  "changed_by" uuid,
  "reason" text,
  "changed_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid UNIQUE NOT NULL,
  "method" payment_method NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'UNPAID',
  "amount" bigint NOT NULL,
  "transaction_ref" varchar(120),
  "paid_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "wash_sessions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid UNIQUE NOT NULL,
  "assigned_staff_id" uuid,
  "status" wash_session_status NOT NULL DEFAULT 'PENDING',
  "fee_amount" bigint,
  "projected_points" int,
  "awarded_points" int,
  "checked_in_at" timestamptz,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "loyalty_accounts" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid UNIQUE NOT NULL,
  "current_points" int NOT NULL DEFAULT 0,
  "total_earned_points" int NOT NULL DEFAULT 0,
  "tier" loyalty_tier NOT NULL DEFAULT 'MEMBER',
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "point_transactions" (
  "id" BIGSERIAL PRIMARY KEY,
  "loyalty_account_id" uuid NOT NULL,
  "booking_id" uuid,
  "type" point_transaction_type NOT NULL,
  "points" int NOT NULL,
  "balance_after" int NOT NULL,
  "reason" varchar(255) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "tier_histories" (
  "id" BIGSERIAL PRIMARY KEY,
  "loyalty_account_id" uuid NOT NULL,
  "old_tier" varchar(20),
  "new_tier" loyalty_tier NOT NULL,
  "total_points_at_change" int NOT NULL,
  "changed_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "customer_combos" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "combo_id" uuid NOT NULL,
  "total_usages" int NOT NULL,
  "remaining_usages" int NOT NULL,
  "status" customer_combo_status NOT NULL DEFAULT 'ACTIVE',
  "activated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "customer_combo_usages" (
  "id" BIGSERIAL PRIMARY KEY,
  "customer_combo_id" uuid NOT NULL,
  "booking_id" uuid UNIQUE NOT NULL,
  "used_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "title" varchar(150) NOT NULL,
  "message" text NOT NULL,
  "type" varchar(50) NOT NULL,
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX "idx_users_role" ON "users" ("role");

CREATE INDEX "idx_users_status" ON "users" ("status");

CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");

CREATE INDEX "idx_otp_verifications_user_id" ON "otp_verifications" ("user_id");

CREATE INDEX "idx_vehicles_customer_id" ON "vehicles" ("customer_id");

CREATE INDEX "idx_package_services_package_id" ON "package_services" ("package_id");

CREATE INDEX "idx_package_services_option_id" ON "package_services" ("option_id");

CREATE INDEX "idx_combo_services_combo_id" ON "combo_services" ("combo_id");

CREATE INDEX "idx_combo_services_option_id" ON "combo_services" ("option_id");

CREATE INDEX "idx_voucher_tiers_voucher_id" ON "voucher_tiers" ("voucher_id");

CREATE INDEX "idx_promotion_tiers_promotion_id" ON "promotion_tiers" ("promotion_id");

CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id");

CREATE INDEX "idx_bookings_vehicle_id" ON "bookings" ("vehicle_id");

CREATE INDEX "idx_bookings_status" ON "bookings" ("status");

CREATE INDEX "idx_bookings_scheduled_at" ON "bookings" ("scheduled_at");

CREATE INDEX "idx_bookings_booking_type" ON "bookings" ("booking_type");

CREATE INDEX "idx_bookings_package_id" ON "bookings" ("package_id");

CREATE INDEX "idx_bookings_combo_id" ON "bookings" ("combo_id");

CREATE INDEX "idx_bookings_voucher_id" ON "bookings" ("voucher_id");

CREATE INDEX "idx_booking_options_option_id" ON "booking_options" ("option_id");

CREATE INDEX "idx_booking_promotions_booking_id" ON "booking_promotions" ("booking_id");

CREATE INDEX "idx_booking_promotions_promotion_id" ON "booking_promotions" ("promotion_id");

CREATE INDEX "idx_booking_status_histories_booking_id" ON "booking_status_histories" ("booking_id");

CREATE INDEX "idx_payments_booking_id" ON "payments" ("booking_id");

CREATE INDEX "idx_wash_sessions_booking_id" ON "wash_sessions" ("booking_id");

CREATE INDEX "idx_wash_sessions_staff_id" ON "wash_sessions" ("assigned_staff_id");

CREATE INDEX "idx_loyalty_accounts_customer_id" ON "loyalty_accounts" ("customer_id");

CREATE INDEX "idx_point_transactions_loyalty_account_id" ON "point_transactions" ("loyalty_account_id");

CREATE INDEX "idx_point_transactions_booking_id" ON "point_transactions" ("booking_id");

CREATE UNIQUE INDEX "uk_point_transactions_booking_type" ON "point_transactions" ("booking_id", "type")
WHERE "booking_id" IS NOT NULL AND "type" IN ('EARN', 'REDEEM');

CREATE INDEX "idx_tier_histories_loyalty_account_id" ON "tier_histories" ("loyalty_account_id");

CREATE INDEX "idx_customer_combos_customer_id" ON "customer_combos" ("customer_id");

CREATE INDEX "idx_customer_combos_combo_id" ON "customer_combos" ("combo_id");

CREATE INDEX "idx_customer_combo_usages_customer_combo_id" ON "customer_combo_usages" ("customer_combo_id");

CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");

COMMENT ON COLUMN "otp_verifications"."attempts" IS 'CHECK: attempts >= 0';

COMMENT ON COLUMN "packages"."base_price" IS 'CHECK: base_price >= 0';

COMMENT ON COLUMN "packages"."duration_minutes" IS 'CHECK: duration_minutes > 0';

COMMENT ON COLUMN "services"."price" IS 'CHECK: price >= 0';

COMMENT ON COLUMN "services"."duration_minutes" IS 'CHECK: duration_minutes >= 0';

COMMENT ON COLUMN "package_services"."option_price" IS 'CHECK: option_price >= 0';

COMMENT ON COLUMN "package_services"."option_duration_minutes" IS 'CHECK: option_duration_minutes >= 0';

COMMENT ON COLUMN "package_services"."quantity" IS 'CHECK: quantity > 0';

COMMENT ON COLUMN "combos"."price" IS 'CHECK: price >= 0';

COMMENT ON COLUMN "combos"."original_price" IS 'CHECK: original_price IS NULL OR original_price >= 0';

COMMENT ON COLUMN "combos"."duration_minutes" IS 'CHECK: duration_minutes > 0';

COMMENT ON COLUMN "combos"."duration_days" IS 'CHECK: duration_days IS NULL OR duration_days > 0';

COMMENT ON COLUMN "combos"."max_usages" IS 'CHECK: max_usages IS NULL OR max_usages > 0';

COMMENT ON COLUMN "combo_services"."option_price" IS 'CHECK: option_price >= 0';

COMMENT ON COLUMN "combo_services"."option_duration_minutes" IS 'CHECK: option_duration_minutes >= 0';

COMMENT ON COLUMN "combo_services"."quantity" IS 'CHECK: quantity > 0';

COMMENT ON TABLE "vouchers" IS 'CHECK: end_at > start_at';

COMMENT ON COLUMN "vouchers"."discount_value" IS 'CHECK: discount_value > 0';

COMMENT ON COLUMN "vouchers"."min_order_amount" IS 'CHECK: min_order_amount >= 0';

COMMENT ON COLUMN "vouchers"."max_discount_amount" IS 'CHECK: max_discount_amount IS NULL OR max_discount_amount >= 0';

COMMENT ON COLUMN "vouchers"."usage_limit" IS 'CHECK: usage_limit IS NULL OR usage_limit > 0';

COMMENT ON COLUMN "vouchers"."used_count" IS 'CHECK: used_count >= 0';

COMMENT ON TABLE "promotions" IS 'CHECK: end_at > start_at';

COMMENT ON COLUMN "promotions"."point_multiplier" IS 'CHECK: point_multiplier > 0';

COMMENT ON TABLE "bookings" IS 'CHECK: PACKAGE requires package_id NOT NULL and combo_id NULL; COMBO requires combo_id NOT NULL and package_id NULL';

COMMENT ON COLUMN "bookings"."base_amount" IS 'CHECK: base_amount >= 0';

COMMENT ON COLUMN "bookings"."options_amount" IS 'CHECK: options_amount >= 0';

COMMENT ON COLUMN "bookings"."discount_amount" IS 'CHECK: discount_amount >= 0';

COMMENT ON COLUMN "bookings"."final_amount" IS 'CHECK: final_amount >= 0';

COMMENT ON COLUMN "bookings"."estimated_duration_minutes" IS 'CHECK: estimated_duration_minutes >= 0';

COMMENT ON COLUMN "bookings"."points_redeemed" IS 'CHECK: points_redeemed >= 0';

COMMENT ON COLUMN "bookings"."points_discount" IS 'CHECK: points_discount >= 0';

COMMENT ON COLUMN "booking_options"."option_price" IS 'CHECK: option_price >= 0';

COMMENT ON COLUMN "booking_promotions"."point_multiplier" IS 'CHECK: point_multiplier > 0';

COMMENT ON COLUMN "payments"."amount" IS 'CHECK: amount >= 0';

COMMENT ON COLUMN "wash_sessions"."fee_amount" IS 'CHECK: fee_amount IS NULL OR fee_amount >= 0';

COMMENT ON COLUMN "wash_sessions"."projected_points" IS 'CHECK: projected_points IS NULL OR projected_points >= 0';

COMMENT ON COLUMN "wash_sessions"."awarded_points" IS 'CHECK: awarded_points IS NULL OR awarded_points >= 0';

COMMENT ON COLUMN "loyalty_accounts"."current_points" IS 'CHECK: current_points >= 0';

COMMENT ON COLUMN "loyalty_accounts"."total_earned_points" IS 'CHECK: total_earned_points >= 0';

COMMENT ON COLUMN "point_transactions"."balance_after" IS 'CHECK: balance_after >= 0';

COMMENT ON COLUMN "tier_histories"."total_points_at_change" IS 'CHECK: total_points_at_change >= 0';

COMMENT ON TABLE "customer_combos" IS 'CHECK: remaining_usages <= total_usages';

COMMENT ON COLUMN "customer_combos"."total_usages" IS 'CHECK: total_usages > 0';

COMMENT ON COLUMN "customer_combos"."remaining_usages" IS 'CHECK: remaining_usages >= 0';

ALTER TABLE "user_preferences" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "otp_verifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "vehicles" ADD FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "package_services" ADD FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "package_services" ADD FOREIGN KEY ("option_id") REFERENCES "services" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "combo_services" ADD FOREIGN KEY ("combo_id") REFERENCES "combos" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "combo_services" ADD FOREIGN KEY ("option_id") REFERENCES "services" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "voucher_tiers" ADD FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "promotion_tiers" ADD FOREIGN KEY ("promotion_id") REFERENCES "promotions" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("customer_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("package_id") REFERENCES "packages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("combo_id") REFERENCES "combos" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookings" ADD FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_options" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_options" ADD FOREIGN KEY ("option_id") REFERENCES "services" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_promotions" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_promotions" ADD FOREIGN KEY ("promotion_id") REFERENCES "promotions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_status_histories" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "booking_status_histories" ADD FOREIGN KEY ("changed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wash_sessions" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wash_sessions" ADD FOREIGN KEY ("assigned_staff_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "loyalty_accounts" ADD FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "point_transactions" ADD FOREIGN KEY ("loyalty_account_id") REFERENCES "loyalty_accounts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "point_transactions" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tier_histories" ADD FOREIGN KEY ("loyalty_account_id") REFERENCES "loyalty_accounts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_combos" ADD FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_combos" ADD FOREIGN KEY ("combo_id") REFERENCES "combos" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_combo_usages" ADD FOREIGN KEY ("customer_combo_id") REFERENCES "customer_combos" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "customer_combo_usages" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
