# Prototype Migration Map

This document maps the current prototype source to the target Next.js App Router structure in `src/app`.
The prototype remains in `prototype-src` as reference code and is excluded from TypeScript builds.

## Migration Rules

- Keep the target runtime under `src`; do not import from `prototype-src` in production pages.
- Use `prototype-src` only as the UI and behavior reference while migrating page by page.
- Replace TanStack Router APIs with Next.js App Router APIs:
  - `Link` from `@tanstack/react-router` becomes `next/link`.
  - `useNavigate` becomes `useRouter` from `next/navigation`.
  - `createFileRoute` files are not copied into runtime.
- Replace prototype local stores with the real frontend data layer:
  - `prototype-src/lib/carwash-store.tsx` is reference only.
  - Customer/server data should use TanStack Query hooks under `src/hooks`.
  - Auth/client session state should use Zustand stores under `src/store`.
- Add `"use client"` only to pages/components that use hooks, browser APIs, Zustand, or form interaction.
- Keep Customer, Staff, and Admin components separate. Shared primitives can live in `src/components/ui`.

## Shared Source Map

| Prototype source | Target location | Action | Notes |
|---|---|---|---|
| `prototype-src/components/ui/*` | `src/components/ui/*` | Adapt then copy | Requires UI dependencies such as Radix, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`. |
| `prototype-src/styles.css` | `src/app/globals.css` or Tailwind config | Adapt | Bring tokens and utility styles carefully; avoid overwriting Next globals blindly. |
| `prototype-src/components/guest-layout.tsx` | `src/components/layouts/GuestLayout.tsx` | Adapt | Replace prototype imports and align with `(auth)/layout.tsx`. |
| `prototype-src/components/role-layouts.tsx` | `src/components/layouts/*` | Rewrite from reference | Split into customer, staff, admin layouts instead of one mixed prototype layout. |
| `prototype-src/components/route-guards.tsx` | `src/components/layouts/AuthGuard.tsx` and `src/middleware.ts` | Rewrite | Use real auth store/token rules and role redirects. |
| `prototype-src/lib/utils.ts` | `src/lib/utils.ts` | Merge carefully | Keep existing helpers and add only missing utilities. |
| `prototype-src/lib/auth.ts` | `src/lib/auth-service.ts`, `src/store/auth.store.ts` | Reference only | Runtime auth must use real API contract from `PROJECT.md`. |
| `prototype-src/lib/carwash-store.tsx` | `src/hooks`, `src/store`, backend APIs | Reference only | Do not migrate as the main production state source. |

## Auth Workspace

| Target route | Prototype source | Supporting source | Action | Dependency |
|---|---|---|---|---|
| `src/app/page.tsx` | `prototype-src/modules/public-auth/pages/PublicHomePage.tsx` | `HeroSection`, `PublicHeader`, `PublicFooter`, preview cards | Adapt | Can be done before backend; mock content only. |
| `src/app/(auth)/login/page.tsx` | `prototype-src/modules/public-auth/pages/LoginPage.tsx` | `LoginForm`, `GuestLayout`, `LanguageSwitcher` | Adapt and wire real login mutation | Depends on FS1 auth data layer and backend login contract. |
| `src/app/(auth)/register/page.tsx` | `prototype-src/modules/public-auth/pages/RegisterPage.tsx` | `RegisterForm`, `GuestLayout`, `LanguageSwitcher` | Adapt and wire real register mutation | Depends on backend register API; default tier must be `MEMBER`. |
| `src/app/(auth)/verify/page.tsx` | `prototype-src/routes/verify.tsx` | Public auth components | Rewrite from reference | Depends on OTP/verify API decision. |
| `src/app/(auth)/forgot-password/page.tsx` | `prototype-src/modules/public-auth/components/ForgotPasswordModal.tsx` | Public auth components | Rewrite as a page or keep modal inside login | Out of mandatory demo unless required by auth flow. |

## Customer Workspace

| Target route | Prototype source | Supporting source | Action | Dependency |
|---|---|---|---|---|
| `src/app/customer/home/page.tsx` | `prototype-src/modules/customer-booking/pages/CustomerHomePage.tsx` | `CustomerHomeHeader`, `PackageCard`, `ActiveComboCard` | Adapt | Depends on profile, booking summary, vehicle, loyalty queries. |
| `src/app/customer/profile/page.tsx` | `prototype-src/pages/profile-page.tsx` | shared profile widgets | Adapt | Depends on profile API. |
| `src/app/customer/vehicles/page.tsx` | `prototype-src/modules/customer-booking/pages/VehiclesPage.tsx` | `VehicleCard`, vehicle mock/types | Adapt and wire list/delete/default | Depends on vehicle CRUD APIs. |
| `src/app/customer/vehicles/add/page.tsx` | `prototype-src/modules/customer-booking/pages/VehicleFormPage.tsx` | `VehicleForm`, brand/model selectors | Adapt | Depends on vehicle create API. |
| `src/app/customer/vehicles/[id]/page.tsx` | `prototype-src/modules/customer-booking/pages/VehicleFormPage.tsx` | `VehicleForm`, brand/model selectors | Adapt for edit mode | Depends on vehicle detail/update API. |
| `src/app/customer/bookings/page.tsx` | `prototype-src/modules/customer-booking/pages/BookingHistoryPage.tsx` | `BookingTable`, history mocks/types | Adapt | Depends on customer booking list API. |
| `src/app/customer/bookings/new/page.tsx` | `prototype-src/modules/customer-booking/pages/BookingPage.tsx` and `prototype-src/pages/bookings-new-page.tsx` | `BookingForm`, package/combo/points components | Adapt as 7-step checkout flow | Depends on vehicles, packages, promotions/vouchers, booking create APIs. |
| `src/app/customer/bookings/[id]/page.tsx` | `prototype-src/pages/bookings-tracker-page.tsx` | `live-tracker.tsx` | Adapt | Depends on booking detail and optional realtime events. |
| `src/app/customer/history/page.tsx` | `prototype-src/modules/customer-booking/pages/WashHistoryPage.tsx` and `BookingHistoryPage.tsx` | `HistoryTabs`, `WashTable`, `BookingTable` | Adapt | Depends on booking history and wash history APIs. |
| `src/app/customer/loyalty/page.tsx` | `prototype-src/pages/loyalty-page.tsx` | loyalty store reference | Adapt | Depends on loyalty summary API. |
| `src/app/customer/loyalty/history/page.tsx` | `prototype-src/modules/customer-booking/pages/PointTransactionsPage.tsx` | `TransactionTable` | Adapt | Depends on point transaction API. |
| `src/app/customer/promotions/page.tsx` | `prototype-src/modules/public-auth/components/PackagePreviewCard.tsx` and promotion/admin mock data | Rewrite from reference | Depends on public/customer promotions API. |
| `src/app/customer/vouchers/page.tsx` | `prototype-src/modules/customer-booking/pages/CustomerHomePage.tsx` voucher behavior | Rewrite from reference | Depends on voucher/redemption API. |
| `src/app/customer/combos/page.tsx` | `prototype-src/modules/customer-booking/components/ComboCard.tsx` | combo mocks/types | Adapt | Depends on combo package API. |
| `src/app/customer/notifications/page.tsx` | `prototype-src/pages/notifications-page.tsx` | notification store reference | Defer | Notification is not mandatory-first. |
| `src/app/customer/settings/page.tsx` | no direct customer module page | Rewrite | Lower priority than mandatory demo flow. |

## Staff Workspace

| Target route | Prototype source | Supporting source | Action | Dependency |
|---|---|---|---|---|
| `src/app/staff/dashboard/page.tsx` | `prototype-src/components/staff-dashboard.tsx` and `prototype-src/routes/staff.dashboard.tsx` | staff layout references | Adapt | Depends on operations summary API. |
| `src/app/staff/operations/page.tsx` | `prototype-src/modules/staff-operations/pages/OperationsBoardPage.tsx` | operations table, filters, status badge | Adapt | Depends on operations queue/list API. |
| `src/app/staff/check-in/page.tsx` | `prototype-src/modules/staff-operations/pages/CheckinDetailPage.tsx` and `prototype-src/routes/staff.check-in.tsx` | `CheckinPanel` | Adapt | Depends on check-in API and booking lookup. |
| `src/app/staff/sessions/[id]/page.tsx` | `prototype-src/modules/staff-operations/pages/WashProgressPage.tsx` | `StartWashPanel`, `CompleteWashPanel`, timer cards | Adapt | Depends on start/complete wash APIs and session detail. |

## Admin Workspace

| Target route | Prototype source | Supporting source | Action | Dependency |
|---|---|---|---|---|
| `src/app/admin/dashboard/page.tsx` | `prototype-src/modules/admin-console/pages/AdminDashboardPage.tsx` | `KpiCard`, trend chart, booking drawer | Adapt | Depends on dashboard metrics and booking summary APIs. |
| `src/app/admin/bookings/page.tsx` | `prototype-src/modules/admin-console/pages/AdminBookingsPage.tsx` | filters, table, booking drawer | Adapt | Depends on admin booking list API. |
| `src/app/admin/bookings/[id]/page.tsx` | `prototype-src/modules/admin-console/components/BookingDetailDrawer.tsx` | staff availability reference | Rewrite as detail page | Depends on booking detail and assign staff APIs. |
| `src/app/admin/customers/page.tsx` | `prototype-src/modules/admin-console/pages/CustomersPage.tsx` | `CustomerTable` | Adapt | Depends on admin customer list API. |
| `src/app/admin/customers/[id]/page.tsx` | `prototype-src/modules/admin-console/pages/CustomerDetailPage.tsx` | profile, vehicles, bookings, wash history, points, tier tabs | Adapt | Depends on customer detail, vehicles, bookings, point transactions APIs. |
| `src/app/admin/promotions/page.tsx` | `prototype-src/modules/admin-console/pages/PromotionsPage.tsx` | `PromotionForm`, `PromotionTable` | Adapt | Depends on promotions CRUD API. |
| `src/app/admin/packages/page.tsx` | `prototype-src/modules/admin-console/pages/WashPackagesPage.tsx` | package components/mocks | Adapt | Depends on package API. |
| `src/app/admin/reports/page.tsx` | `prototype-src/modules/admin-console/pages/ReportsPage.tsx` | report cards/charts | Adapt | Lower priority than mandatory demo. |
| `src/app/admin/settings/page.tsx` | `prototype-src/modules/admin-console/pages/SettingsPage.tsx` | settings sections | Adapt | Lower priority than mandatory demo. |
| `src/app/admin/staff/page.tsx` | `prototype-src/routes/admin.rbac.tsx` and store references | Rewrite | Depends on staff/admin account API. |
| `src/app/admin/operations/page.tsx` | staff operations prototype | Rewrite/adapt selectively | Admin should view operations without reusing staff-only actions blindly. |
| `src/app/admin/add-ons/page.tsx` | no direct page | Rewrite | Depends on add-on API. |
| `src/app/admin/combos/page.tsx` | customer combo components and admin mocks | Rewrite/adapt | Depends on combo CRUD API. |
| `src/app/admin/vouchers/page.tsx` | promotion/voucher references in stores | Rewrite | Depends on voucher CRUD API. |
| `src/app/admin/login/page.tsx` | `prototype-src/modules/public-auth/pages/LoginPage.tsx` | `LoginForm` | Rewrite or remove | `PROJECT.md` includes route, but staff/admin auth is outside FS1. |

## Recommended Migration Order

| Order | Area | Routes | Reason |
|---|---|---|---|
| 1 | Shared UI foundation | `src/components/ui`, layouts, global styles | Needed by all migrated pages. |
| 2 | Auth | landing, login, register, verify | Unlocks role-based navigation and backend auth demo. |
| 3 | Customer vehicle flow | vehicles list/add/edit | Required by first mandatory demo flow. |
| 4 | Customer booking flow | bookings list/new/detail | Required by full booking demo. |
| 5 | Staff operations | operations, check-in, session detail | Required for check-in, fee/points visibility, wash lifecycle. |
| 6 | Loyalty and promotions | customer loyalty/history/promotions, admin promotions | Required for points, promotion, tier upgrade demo. |
| 7 | Admin mandatory pages | dashboard, bookings, customers, customer detail | Required for admin demo and transaction history. |

## Files To Avoid Copying Directly

| Prototype file | Why |
|---|---|
| `prototype-src/routes/*` | TanStack Router route files are framework-specific. Use them only to identify the source page. |
| `prototype-src/router.tsx`, `start.ts`, `server.ts`, `pages-entry.tsx` | Vite/TanStack startup files do not belong in Next.js. |
| `prototype-src/lib/carwash-store.tsx` | Large local mock store; production state should be split into API hooks and Zustand stores. |
| `prototype-src/lib/app-store.tsx`, `portal-store.tsx`, `wash-store.tsx` | Mock orchestration stores; migrate only the needed domain logic. |
| `prototype-src/modules/**/mock/*` | Useful for temporary visual states only; do not wire production pages to mocks after APIs exist. |

