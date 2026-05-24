import { readForm, setFieldError } from "../../utils/dom.js";
import { roleHome, setSession } from "../../store/session-store.js";

const phonePattern = /^0[0-9]{9}$/;
const otpPattern = /^[0-9]{6}$/;

export function initLoginForm() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);
    const role = data.role || "CUSTOMER";

    setSession({
      role,
      fullName: data.phone === "0900000000" ? "Admin AutoWash" : "Demo User",
      phone: data.phone,
    });

    window.location.href = roleHome(role);
  });
}

export function initRegisterForm() {
  const form = document.querySelector("[data-register-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);
    let valid = true;

    setFieldError(form, "phone", "");
    setFieldError(form, "password", "");

    if (!phonePattern.test(String(data.phone || ""))) {
      setFieldError(form, "phone", "So dien thoai phai co 10 chu so va bat dau bang 0.");
      valid = false;
    }

    if (String(data.password || "").length < 8 || data.password !== data.confirmPassword) {
      setFieldError(form, "password", "Mat khau toi thieu 8 ky tu va phai khop xac nhan.");
      valid = false;
    }

    if (valid) {
      sessionStorage.setItem("autowash.pendingRegistration", JSON.stringify(data));
      window.location.href = "/src/pages/auth/verify-otp.html";
    }
  });
}

export function initOtpForm() {
  const form = document.querySelector("[data-otp-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);
    setFieldError(form, "otp", "");

    if (!otpPattern.test(String(data.otp || ""))) {
      setFieldError(form, "otp", "Ma OTP phai gom 6 chu so.");
      return;
    }

    const pending = JSON.parse(sessionStorage.getItem("autowash.pendingRegistration") || "{}");
    setSession({ role: "CUSTOMER", fullName: pending.fullName || "Customer", phone: pending.phone });
    sessionStorage.removeItem("autowash.pendingRegistration");
    window.location.href = roleHome("CUSTOMER");
  });
}
