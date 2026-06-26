ALTER TABLE "wash_sessions" DROP CONSTRAINT IF EXISTS "wash_sessions_booking_id_key";

ALTER TABLE "wash_sessions" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;

ALTER TABLE "wash_sessions" ADD COLUMN IF NOT EXISTS "cancel_reason" varchar(500);

CREATE UNIQUE INDEX IF NOT EXISTS "uk_bookings_customer_voucher" ON "bookings" ("customer_id", "voucher_id");
