import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getWorkspaceHeaderMeta } from "./workspace-header-meta.ts";

describe("getWorkspaceHeaderMeta", () => {
  it("describes the customer booking workspace route", () => {
    const meta = getWorkspaceHeaderMeta("/customer/bookings/new");

    assert.equal(meta.title, "Bookings");
    assert.equal(meta.subtitle, "Create and track wash appointments");
    assert.equal(meta.workspace, "CUSTOMER");
  });

  it("describes staff operations routes without changing their URL shape", () => {
    const meta = getWorkspaceHeaderMeta("/staff/sessions/WS-01");

    assert.equal(meta.title, "Wash Session");
    assert.equal(meta.workspace, "STAFF");
  });

  it("falls back to a stable overview label for unknown admin sub-pages", () => {
    const meta = getWorkspaceHeaderMeta("/admin/not-yet-modeled");

    assert.equal(meta.title, "Overview");
    assert.equal(meta.workspace, "ADMIN");
  });
});
