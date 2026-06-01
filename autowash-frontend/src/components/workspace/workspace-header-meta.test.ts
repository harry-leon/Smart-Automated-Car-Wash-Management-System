import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getWorkspaceHeaderMeta } from "./workspace-header-meta.ts";

describe("getWorkspaceHeaderMeta", () => {
  it("mô tả đúng route đặt lịch của khách hàng", () => {
    const meta = getWorkspaceHeaderMeta("/customer/bookings/new");

    assert.equal(meta.title, "Đặt lịch");
    assert.equal(meta.subtitle, "Tạo và theo dõi lịch rửa xe");
    assert.equal(meta.workspace, "CUSTOMER");
  });

  it("mô tả route phiên rửa nhân viên mà không đổi cấu trúc URL", () => {
    const meta = getWorkspaceHeaderMeta("/staff/sessions/WS-01");

    assert.equal(meta.title, "Phiên rửa");
    assert.equal(meta.workspace, "STAFF");
  });

  it("ưu tiên route lịch sử phiên rửa trước route chi tiết phiên", () => {
    const meta = getWorkspaceHeaderMeta("/staff/sessions/history");

    assert.equal(meta.title, "Lịch sử phiên rửa");
    assert.equal(meta.workspace, "STAFF");
  });

  it("dùng nhãn tổng quan ổn định cho trang quản trị chưa khai báo", () => {
    const meta = getWorkspaceHeaderMeta("/admin/not-yet-modeled");

    assert.equal(meta.title, "Tổng quan");
    assert.equal(meta.workspace, "ADMIN");
  });
});
