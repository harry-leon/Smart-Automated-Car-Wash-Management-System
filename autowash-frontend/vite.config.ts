import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login.html"),
        register: resolve(__dirname, "src/pages/auth/register.html"),
        verifyOtp: resolve(__dirname, "src/pages/auth/verify-otp.html"),
        customerHome: resolve(__dirname, "src/pages/customer/home.html"),
        customerBooking: resolve(__dirname, "src/pages/customer/booking.html"),
        staffQueue: resolve(__dirname, "src/pages/staff/queue.html"),
        adminDashboard: resolve(__dirname, "src/pages/admin/dashboard.html"),
      },
    },
  },
});
