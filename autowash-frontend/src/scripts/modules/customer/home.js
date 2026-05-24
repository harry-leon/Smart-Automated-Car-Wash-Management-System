import { $ } from "../../utils/dom.js";

export function initCustomerHome() {
  const lastBooking = JSON.parse(sessionStorage.getItem("autowash.lastBooking") || "null");
  const target = $("[data-last-booking]");
  if (!target || !lastBooking) return;

  target.innerHTML = `
    <h3>Booking gan nhat</h3>
    <p><strong>${lastBooking.plate}</strong> - ${lastBooking.bookingDate} ${lastBooking.bookingTime}</p>
    <span class="badge" data-tone="success">Da xac nhan</span>
  `;
}
