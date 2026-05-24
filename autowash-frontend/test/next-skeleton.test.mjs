import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(process.cwd());
const requiredFiles = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/(auth)/layout.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/register/page.tsx",
  "src/app/(auth)/verify/page.tsx",
  "src/app/(auth)/verify-otp/page.tsx",
  "src/app/(auth)/forgot-password/page.tsx",
  "src/app/(customer)/layout.tsx",
  "src/app/(customer)/customer/page.tsx",
  "src/app/(customer)/customer/home/page.tsx",
  "src/app/(customer)/customer/profile/page.tsx",
  "src/app/(customer)/customer/vehicles/page.tsx",
  "src/app/(customer)/customer/bookings/page.tsx",
  "src/app/(customer)/customer/bookings/new/page.tsx",
  "src/app/(customer)/customer/loyalty/page.tsx",
  "src/app/(customer)/customer/notifications/page.tsx",
  "src/app/(customer)/customer/combos/page.tsx",
  "src/app/(staff)/layout.tsx",
  "src/app/(staff)/staff/page.tsx",
  "src/app/(staff)/staff/dashboard/page.tsx",
  "src/app/(staff)/staff/operations/page.tsx",
  "src/app/(staff)/staff/check-in/page.tsx",
  "src/app/(admin)/layout.tsx",
  "src/app/(admin)/admin/page.tsx",
  "src/app/(admin)/admin/dashboard/page.tsx",
  "src/app/(admin)/admin/bookings/page.tsx",
  "src/app/(admin)/admin/customers/page.tsx",
  "src/app/(admin)/admin/operations/page.tsx",
  "src/app/(admin)/admin/reports/page.tsx",
];

const forbiddenFiles = [
  "src/app/router.tsx",
  "src/app/routes",
  "src/app/pages",
  "src/pages",
  "src/scripts",
  "src/server.ts",
  "src/start.ts",
  "vite.config.ts",
  "vite.pages.config.ts",
  "wrangler.jsonc",
  "index.html",
  "bun.lock",
];

test("Next skeleton files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(existsSync(resolve(root, file)), true, `Expected ${file} to exist`);
  }
});

test("Legacy Vite/TanStack files are removed", () => {
  for (const file of forbiddenFiles) {
    assert.equal(existsSync(resolve(root, file)), false, `Expected ${file} to be removed`);
  }
});
