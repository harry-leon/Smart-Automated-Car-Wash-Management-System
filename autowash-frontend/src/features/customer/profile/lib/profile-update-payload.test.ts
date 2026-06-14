import assert from "node:assert/strict";
import test from "node:test";
import { buildUpdateUserProfileRequest } from "./profile-update-payload.ts";

test("normalizes blank email to null before updating profile", () => {
  assert.deepEqual(
    buildUpdateUserProfileRequest({
      fullName: "  Nguyen Van A  ",
      email: "   ",
      phone: "0981641622",
    }),
    {
      fullName: "Nguyen Van A",
      email: null,
      phone: "0981641622",
    },
  );
});

test("keeps a non-empty email value when updating profile", () => {
  assert.deepEqual(
    buildUpdateUserProfileRequest({
      fullName: "Nguyen Van A",
      email: " customer@example.com ",
      phone: "0981641622",
    }),
    {
      fullName: "Nguyen Van A",
      email: "customer@example.com",
      phone: "0981641622",
    },
  );
});
