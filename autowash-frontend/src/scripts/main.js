import { setActiveNav } from "./utils/dom.js";
import { initLoginForm, initOtpForm, initRegisterForm } from "./modules/auth/auth.js";
import { initBookingForm } from "./modules/customer/booking.js";
import { initCustomerHome } from "./modules/customer/home.js";
import { initStaffQueue } from "./modules/staff/queue.js";
import { initAdminDashboard } from "./modules/admin/dashboard.js";

setActiveNav();
initLoginForm();
initRegisterForm();
initOtpForm();
initCustomerHome();
initBookingForm();
initStaffQueue();
initAdminDashboard();
