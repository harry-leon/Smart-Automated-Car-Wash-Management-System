import { formatVnd } from "../../utils/format.js";

export function initAdminDashboard() {
  const revenue = document.querySelector("[data-admin-revenue]");
  if (revenue) {
    revenue.textContent = formatVnd(18450000);
  }
}
