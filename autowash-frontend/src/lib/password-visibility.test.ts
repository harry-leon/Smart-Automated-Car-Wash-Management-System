import assert from "node:assert/strict";
import test from "node:test";
import { getPasswordVisibilityState } from "./password-visibility.ts";

test("hidden password uses password input type and show action", () => {
  assert.deepEqual(getPasswordVisibilityState(false), {
    actionLabel: "Show password",
    inputType: "password",
  });
});

test("visible password uses text input type and hide action", () => {
  assert.deepEqual(getPasswordVisibilityState(true), {
    actionLabel: "Hide password",
    inputType: "text",
  });
});
