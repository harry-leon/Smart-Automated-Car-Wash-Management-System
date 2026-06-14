import assert from "node:assert/strict";
import test from "node:test";
import {
  getLoginIdentifierValidationMessage,
  normalizeLoginIdentifier,
} from "./login-identifier.ts";

test("normalizes whitespace from login identifiers", () => {
  assert.equal(normalizeLoginIdentifier(" 0981 641 622 "), "0981641622");
});

test("accepts Vietnamese phone numbers", () => {
  assert.equal(getLoginIdentifierValidationMessage("0981641622"), null);
});

test("accepts email addresses", () => {
  assert.equal(getLoginIdentifierValidationMessage("customer@gmail.com"), null);
});

test("rejects invalid login identifiers", () => {
  assert.equal(
    getLoginIdentifierValidationMessage("invalid-identifier"),
    "Enter a valid Vietnamese phone number or email address.",
  );
});
