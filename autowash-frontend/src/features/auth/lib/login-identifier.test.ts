import assert from "node:assert/strict";
import test from "node:test";
import {
  getLoginIdentifierValidationMessage,
  normalizeLoginIdentifier,
} from "./login-identifier.ts";

test("normalizes whitespace from login identifiers", () => {
  assert.equal(normalizeLoginIdentifier(" customer@gmail.com "), "customer@gmail.com");
});

test("accepts email addresses", () => {
  assert.equal(getLoginIdentifierValidationMessage("customer@gmail.com"), null);
});

test("rejects invalid login identifiers", () => {
  assert.equal(
    getLoginIdentifierValidationMessage("invalid-identifier"),
    "Enter a valid email address.",
  );
});
