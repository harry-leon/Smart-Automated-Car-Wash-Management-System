import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingDetailQueryKey,
  bookingQueryScope,
  bookingsListQueryKey,
  bookingVoucherQueryKey,
} from "./booking-query.ts";

test("scopes booking cache by current user", () => {
  assert.deepEqual(bookingQueryScope("user_123"), ["customer-bookings", "user_123"]);
});

test("builds a list query key including filters and pagination", () => {
  assert.deepEqual(
    bookingsListQueryKey("user_123", {
      status: "CONFIRMED",
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      page: 2,
      limit: 10,
    }),
    [
      "customer-bookings",
      "user_123",
      "list",
      "CONFIRMED",
      "2026-06-01",
      "2026-06-30",
      2,
      10,
    ],
  );
});

test("builds a detail query key for a single booking", () => {
  assert.deepEqual(bookingDetailQueryKey("user_123", "BK_001"), [
    "customer-bookings",
    "user_123",
    "detail",
    "BK_001",
  ]);
});

test("builds a voucher validation key that includes amount and package context", () => {
  assert.deepEqual(bookingVoucherQueryKey("user_123", "WELCOME20", 150000, "pkg_001"), [
    "customer-bookings",
    "user_123",
    "voucher",
    "WELCOME20",
    150000,
    "pkg_001",
  ]);
});
