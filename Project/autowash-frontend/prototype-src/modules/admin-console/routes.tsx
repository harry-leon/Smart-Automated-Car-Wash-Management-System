import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminBookingsPage } from "./pages/AdminBookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { LoyaltyPage } from "./pages/LoyaltyPage";
import { PromotionsPage } from "./pages/PromotionsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const adminRoutes = {
  dashboard: AdminDashboardPage,
  bookings: AdminBookingsPage,
  customers: CustomersPage,
  customerDetail: CustomerDetailPage,
  loyalty: LoyaltyPage,
  promotions: PromotionsPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

export type AdminRouteKey = keyof typeof adminRoutes;
