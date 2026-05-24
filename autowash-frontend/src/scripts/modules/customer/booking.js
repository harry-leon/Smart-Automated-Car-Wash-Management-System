import { $, readForm, setFieldError } from "../../utils/dom.js";
import { formatVnd } from "../../utils/format.js";

const packages = {
  standard: 120000,
  premium: 220000,
  ceramic: 420000,
};

const addons = {
  tire: 50000,
  engine: 90000,
  deodorize: 70000,
};

export function initBookingForm() {
  const form = $("[data-booking-form]");
  if (!form) return;

  const totalOutput = $("[data-booking-total]");
  const updateTotal = () => {
    const data = readForm(form);
    const addonTotal = [...form.querySelectorAll("[name='addons']:checked")]
      .map((input) => addons[input.value] || 0)
      .reduce((sum, value) => sum + value, 0);
    const voucherDiscount = String(data.voucherCode || "").toUpperCase() === "AURA50" ? 50000 : 0;
    totalOutput.textContent = formatVnd((packages[data.packageId] || 0) + addonTotal - voucherDiscount);
  };

  form.addEventListener("input", updateTotal);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);
    setFieldError(form, "plate", "");

    if (!/^[0-9]{2}[A-Z][0-9]?-?[0-9]{4,6}$/i.test(String(data.plate || "").replace(/\s|\./g, ""))) {
      setFieldError(form, "plate", "Bien so xe chua dung dinh dang Viet Nam.");
      return;
    }

    sessionStorage.setItem("autowash.lastBooking", JSON.stringify({ ...data, status: "CONFIRMED" }));
    window.location.href = "/src/pages/customer/home.html";
  });

  updateTotal();
}
