import assert from "node:assert/strict";
import test from "node:test";
import {
  customerVehicleDetailQueryKey,
  customerVehiclesQueryKey,
  customerVehiclesQueryScope,
} from "./customer-vehicle-query.ts";

test("scopes customer vehicle cache by current user", () => {
  assert.deepEqual(customerVehiclesQueryScope("user_123"), ["customer-vehicles", "user_123"]);
});

test("builds a list query key including pagination", () => {
  assert.deepEqual(customerVehiclesQueryKey("user_123", 2, 10), [
    "customer-vehicles",
    "user_123",
    "list",
    2,
    10,
  ]);
});

test("builds a detail query key for a single vehicle", () => {
  assert.deepEqual(customerVehicleDetailQueryKey("user_123", "vehicle_456"), [
    "customer-vehicles",
    "user_123",
    "detail",
    "vehicle_456",
  ]);
});
