import assert from "node:assert/strict";
import test from "node:test";
import { customerProfileQueryKey } from "./customer-profile-query.ts";

test("scopes customer profile query cache by user id", () => {
  assert.deepEqual(customerProfileQueryKey("user_123"), ["customer-profile", "user_123"]);
});

test("uses anonymous fallback for missing user id", () => {
  assert.deepEqual(customerProfileQueryKey(null), ["customer-profile", "anonymous"]);
});
