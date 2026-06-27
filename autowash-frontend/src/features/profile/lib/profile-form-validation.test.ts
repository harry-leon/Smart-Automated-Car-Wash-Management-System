import assert from "node:assert/strict";
import test from "node:test";
import { validateProfileForm } from "./profile-form-validation.ts";

test("allows null phone values without throwing and does not report a phone validation error", () => {
  assert.deepEqual(
    validateProfileForm({
      fullName: "Nguyen Van A",
      email: "customer@example.com",
      phone: null,
    }),
    {
      fullName: null,
      email: null,
      phone: null,
    },
  );
});

test("validates trimmed full name, email, and phone values", () => {
  assert.deepEqual(
    validateProfileForm({
      fullName: "  ",
      email: " customer@example.com ",
      phone: " 0901234567 ",
    }),
    {
      fullName: "Full name is required.",
      email: null,
      phone: null,
    },
  );
});
