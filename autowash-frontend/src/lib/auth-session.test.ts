import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAuthSession,
  getAuthRedirectPath,
  isCustomerRole,
} from "./auth-session.ts";

test("maps customer role to the customer workspace home", () => {
  assert.equal(getAuthRedirectPath("CUSTOMER"), "/customer/home");
});

test("maps staff role to the staff workspace dashboard", () => {
  assert.equal(getAuthRedirectPath("STAFF"), "/staff/dashboard");
});

test("maps admin role to the admin workspace dashboard", () => {
  assert.equal(getAuthRedirectPath("ADMIN"), "/admin/dashboard");
});

test("accepts customer role for customer auth flow", () => {
  assert.equal(isCustomerRole("CUSTOMER"), true);
});

test("rejects non-customer role for customer auth flow", () => {
  assert.equal(isCustomerRole("STAFF"), false);
});

test("builds auth session from API auth payload", () => {
  const session = buildAuthSession({
    userId: "user_123",
    fullName: "Nguyen Van A",
    phone: "0901234567",
    email: "nguyenvana@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
    tier: "MEMBER",
    loyaltyBalance: 10,
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 3600,
  });

  assert.deepEqual(session, {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 3600,
    user: {
      userId: "user_123",
      fullName: "Nguyen Van A",
      phone: "0901234567",
      email: "nguyenvana@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
      tier: "MEMBER",
      loyaltyBalance: 10,
    },
  });
});
