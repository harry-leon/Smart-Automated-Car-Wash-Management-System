# AutoWash Pro

> Prototype Specification Refinement
> Derived from observable frontend behavior, mock state, and local simulation logic

| Field | Value |
|---|---|
| System | AutoWash Pro / AURA CAR CARE |
| Repository Type | Frontend prototype |
| Primary Sources | UI logic, local stores, mock data, route behavior |
| Enforcement Model | Frontend-only simulation |
| Persistence | Browser localStorage plus module-local in-memory mock state |

---

## Table of Contents

- [1. Prototype Scope](#1-prototype-scope)
- [2. Prototype Architecture Notes](#2-prototype-architecture-notes)
- [3. Role-Based Main Flows](#3-role-based-main-flows)
- [4. Business Rules](#4-business-rules)
  - [4.1 Authentication, Access, and Localization](#41-authentication-access-and-localization)
  - [4.2 Customer Registration and Profile](#42-customer-registration-and-profile)
  - [4.3 Vehicle Management](#43-vehicle-management)
  - [4.4 Customer Booking and Payment Simulation](#44-customer-booking-and-payment-simulation)
  - [4.5 Shared Booking and Operational Simulation](#45-shared-booking-and-operational-simulation)
  - [4.6 Staff Operations](#46-staff-operations)
  - [4.7 Loyalty, Points, and Membership](#47-loyalty-points-and-membership)
  - [4.8 Promotions, Vouchers, and Combos](#48-promotions-vouchers-and-combos)
  - [4.9 Admin Management UI](#49-admin-management-ui)
  - [4.10 Notifications and Audit-Like Behavior](#410-notifications-and-audit-like-behavior)
- [5. Function to Business Rule Mapping](#5-function-to-business-rule-mapping)
- [6. Reconciliation with Baseline README](#6-reconciliation-with-baseline-readme)
- [7. Open Assumptions and Prototype Notes](#7-open-assumptions-and-prototype-notes)

---

## 1. Prototype Scope

### 1.1 What this repository actually is

This repository is a prototype that simulates a smart car wash system through frontend routes, local stores, and mock data. There is no real backend, database, payment gateway, or external service integration.

Observable behavior comes from:

- route guards and page navigation
- local React state and shared store logic
- in-memory mock booking, loyalty, combo, and voucher data
- browser localStorage persistence in the shared portal store
- UI forms, validation messages, and state transitions

### 1.2 In scope

- public homepage for unauthenticated visitors
- demo login, registration, OTP verification, and guest-only routing
- role-based workspaces for `Customer`, `Staff`, and `Admin`
- customer profile editing
- customer vehicle management
- customer booking checkout flow with simulated upfront payment choice
- customer loyalty, combo, voucher, and booking history views
- staff check-in, start wash, and complete wash simulation
- admin dashboards, bookings, customers, loyalty, promotions, reports, and settings
- local notifications for reminders and loyalty point expiry

### 1.3 Out of scope

- real backend/API enforcement
- real payment processing
- real OTP delivery
- real email delivery
- database persistence
- hardware integration
- a single end-to-end state model shared consistently by every module

---

## 2. Prototype Architecture Notes

This prototype currently uses two different state models:

1. `src/lib/carwash-store.tsx`
   - shared portal store
   - powers authentication, staff operations, admin pages, reminders, settings, transactions, and most portal-level business logic
   - persists to `localStorage`

2. `src/modules/customer-booking/routes.tsx`
   - module-local customer booking store
   - powers `/customer/home`, `/customer/vehicles`, `/customer/bookings/new`, customer booking history tabs, and `/customer/loyalty`
   - keeps its own mock vehicles, packages, combos, vouchers, and bookings

Important consequence:

- customer booking pages and admin/staff pages are not fully synchronized to one shared source of truth
- admin package and promotion edits affect the shared portal store, but the customer booking module still reads its own mock package/combo/voucher catalog
- some role flows are therefore behaviorally valid inside their own module, but not fully connected across the entire app

This README documents observable behavior exactly as implemented, including those prototype splits.

---

## 3. Role-Based Main Flows

### 3.1 Visitor Flow

1. Visitor lands on `/`.
2. If not authenticated, the public homepage renders.
3. Visitor can browse services, combos, testimonials, and language/theme toggles.
4. Visitor can open `Sign In` or `Register`.
5. If already authenticated, the visitor is redirected to the role-specific home page instead of staying on guest pages.

### 3.2 Customer Flow

1. Customer registers with full name, Vietnamese phone number, password, and password confirmation.
2. Registration sends a prototype OTP and redirects to `/verify`.
3. After OTP verification, the account is activated locally and the user is sent to the customer workspace.
4. Customer can edit profile details on `/customer/profile`.
5. Customer manages vehicles on `/customer/vehicles`.
6. Customer enters `/customer/bookings/new` to create a booking through a checkout-style flow.
7. Customer selects either:
   - `SINGLE_PACKAGE`, with package, add-ons, voucher, and payment method
   - `COMBO`, using the active combo and linked vehicle
8. Payment is simulated in the booking form itself:
   - zero-amount combo bookings are treated as paid
   - bank transfer and e-wallet are mock paid flows
   - cash at counter is stored as pay-later
9. Confirming the form creates a `CONFIRMED` booking inside the customer-booking module state and shows a success screen.
10. Customer can review booking, wash, and point history tabs.
11. Customer can redeem points into vouchers from customer home or loyalty pages.

### 3.3 Staff Flow

1. Staff signs in and lands on `/staff/dashboard`.
2. Staff opens `/staff/operations` or `/staff/check-in`.
3. Staff filters the queue by status, time bucket, hour, and assigned staff.
4. Staff opens a booking detail page.
5. Staff must verify the plate before check-in.
6. Check-in moves the booking into the operational queue and assigns an active available staff member.
7. Staff starts the wash after successful check-in.
8. Staff completes the wash from the wash progress page.
9. Completion records points earned in the shared portal store.

### 3.4 Admin Flow

1. Admin signs in and lands on `/admin/dashboard`.
2. Admin reviews KPI cards, bookings, staff assignment, and current status.
3. Admin opens `/admin/bookings` to filter bookings and override status where allowed.
4. Admin opens `/admin/customers` to inspect profile, vehicles, bookings, wash history, point history, and tier history.
5. Admin manages shared-store wash packages, promotions, loyalty rules, reports, and workspace settings.
6. Admin changes are local prototype state changes only.

---

## 4. Business Rules

### 4.1 Authentication, Access, and Localization

| BR ID | Rule |
|---|---|
| BR-01 | `/` is the public landing page for unauthenticated users. |
| BR-02 | Authenticated users are redirected away from guest pages to their role home path. |
| BR-03 | Role home paths are `/customer/home`, `/staff/dashboard`, and `/admin/dashboard`. |
| BR-04 | Protected routes redirect unauthenticated users to `/login`. |
| BR-05 | Protected routes render an access denied state when the signed-in role is not allowed. |
| BR-06 | Customer login succeeds only if credentials match a local auth account and the linked customer record is `Active`. |
| BR-07 | Staff login succeeds only if an active staff record can be resolved. |
| BR-08 | Demo role switching exists in the shell and can replace the current workspace role without real backend auth. |
| BR-09 | Customer-facing copy supports English and Vietnamese toggles. |
| BR-10 | The customer booking module persists its selected language in `localStorage`. |

### 4.2 Customer Registration and Profile

| BR ID | Rule |
|---|---|
| BR-11 | Registration form requires full name, Vietnamese phone number, password, and confirm password. |
| BR-12 | Registration form does not collect email in the current UI. |
| BR-13 | Password must be at least 6 characters. |
| BR-14 | Confirm password must match password. |
| BR-15 | Phone number must match Vietnamese local format `0` followed by 9 digits. |
| BR-16 | Registration starts an OTP challenge before creating the account. |
| BR-17 | OTP must be verified before the account is activated. |
| BR-18 | Registration OTP can be resent while a pending registration exists. |
| BR-19 | Completing registration creates a new `Customer` account with tier `Member`, 0 points, and `Active` status in the shared store. |
| BR-20 | If no email is supplied during registration, the shared store generates a placeholder local email from the phone number. |
| BR-21 | Phone numbers must be unique among active customers and auth accounts. |
| BR-22 | Profile editing on `/customer/profile` requires non-empty name, valid email shape, and 8-11 numeric phone digits. |
| BR-23 | Profile page displays phone and email as verified; this is presentation behavior, not backend proof. |
| BR-24 | The shared store contains a pending phone-change OTP flow, but the current customer profile page does not expose that flow in its UI. |
| BR-25 | Forgot password is a standalone UI simulation using hardcoded OTP `123456`; it does not update shared auth credentials. |

### 4.3 Vehicle Management

| BR ID | Rule |
|---|---|
| BR-26 | Customer booking pages cannot proceed to booking when the module-local vehicle list is empty. |
| BR-27 | Vehicle form in the customer booking module requires a license plate. |
| BR-28 | Vehicle form lets the user select brand first, then model from a brand-specific catalog. |
| BR-29 | Vehicle type is auto-derived from the selected brand-model mapping and is read-only in the form. |
| BR-30 | Vehicle color is optional. |
| BR-31 | Vehicle photo upload is optional, but uploaded files must be images. |
| BR-32 | The first customer-booking vehicle becomes default automatically. |
| BR-33 | Marking a vehicle as default unsets other defaults in the customer-booking module. |
| BR-34 | Deleting the default vehicle in the customer-booking module promotes the first remaining vehicle to default. |
| BR-35 | Shared-store vehicle records normalize plates to uppercase and strip spaces before storing/matching. |
| BR-36 | Shared-store vehicle plates must match Vietnamese plate format such as `51G-123.45` or `85F1-072.22`. |
| BR-37 | In the shared store, an active customer cannot take a plate already owned by another active customer. |
| BR-38 | In the shared store, a plate from an inactive owner can be transferred and logged to vehicle ownership history. |
| BR-39 | Shared-store vehicle deletion is blocked when the customer would be left with zero vehicles. |

### 4.4 Customer Booking and Payment Simulation

| BR ID | Rule |
|---|---|
| BR-40 | The customer booking form supports `SINGLE_PACKAGE` and `COMBO` booking modes. |
| BR-41 | Only service packages with status `ACTIVE` appear in the customer booking checkout flow. |
| BR-42 | Combo mode is disabled when there is no active combo or remaining combo uses are zero. |
| BR-43 | Combo mode auto-locks the booking to the combo-linked vehicle and combo-supported package. |
| BR-44 | Single-package mode allows add-on selection; combo mode does not expose add-ons in the form. |
| BR-45 | Customer booking schedule defaults to tomorrow at `10:30`. |
| BR-46 | Booking time picker blocks slots already occupied by module-local bookings in statuses `CONFIRMED`, `CHECKED_IN`, or `IN_PROGRESS`. |
| BR-47 | Customer booking supports one voucher per booking. |
| BR-48 | Manual voucher entry only works if the code matches a currently usable customer voucher. |
| BR-49 | A usable voucher must be owned by the customer, `ACTIVE`, not disabled, not expired, under its usage limit, eligible for the current tier, and valid for new-customer targeting if flagged that way. |
| BR-50 | Single-package payment methods are `CASH_AT_COUNTER`, `BANK_TRANSFER`, and `E_WALLET`. |
| BR-51 | `BANK_TRANSFER`, `E_WALLET`, or zero-amount bookings are marked `PAID` immediately in the booking snapshot. |
| BR-52 | Cash bookings are stored with payment status `PAY_AT_COUNTER`. |
| BR-53 | Combo bookings always store final amount `0` and are treated as paid via combo credit. |
| BR-54 | Confirming the customer booking form creates a module-local booking with status `CONFIRMED`. |
| BR-55 | Confirming a customer booking immediately marks the selected voucher as `USED` and increments its usage count. |
| BR-56 | Customer booking success screen displays booking code, vehicle, service, schedule, voucher, payment method/status, booking status, and final amount. |

### 4.5 Shared Booking and Operational Simulation

| BR ID | Rule |
|---|---|
| BR-57 | Shared-store booking creation is blocked for blocked customers. |
| BR-58 | Shared-store booking creation is blocked while `bookingSuspendedUntil` is still in the future. |
| BR-59 | Shared-store booking dates cannot be in the past for non-walk-in bookings. |
| BR-60 | Shared-store booking window depends on the customer tier's `bookingWindowDays`. |
| BR-61 | Shared-store non-walk-in customers can hold at most 3 active bookings at once. |
| BR-62 | Shared-store duplicate booking by same vehicle, date, and time slot is not allowed while any matching booking is still active. |
| BR-63 | Shared-store slot capacity is limited by shop capacity. |
| BR-64 | Shared-store reserves the last open slot for `Platinum` customers when no Platinum customer has already booked that slot. |
| BR-65 | Shared-store customer notes are sanitized through a profanity mask before storage. |
| BR-66 | Shared-store cancellation is only allowed from `Pending` or `Confirmed`. |
| BR-67 | Shared-store cancellation is blocked when the booking starts in less than 2 hours. |
| BR-68 | Shared-store auto-ban can block a customer after too many cancellations within a rolling window, using settings-driven thresholds. |
| BR-69 | Shared-store operational check-in is allowed only from `Confirmed` or `Pending`. |
| BR-70 | Shared-store operational check-in marks a booking `No-show` if arrival is more than 20 minutes late. |
| BR-71 | Legacy session preparation marks a booking `No-show` if arrival is more than 15 minutes late. |
| BR-72 | Two no-shows inside 30 days in the legacy preparation path trigger a 14-day booking suspension. |
| BR-73 | Shared-store operational check-in creates or refreshes a wash session in `Queued` state and assigns an active available staff member. |
| BR-74 | Shared-store operational wash start is allowed only after a booking is `Checked-in`. |
| BR-75 | Starting a wash updates booking wash status to `In Progress`. |
| BR-76 | Completing an operational wash is allowed only when booking status is `Checked-in` and wash status is `In Progress`. |
| BR-77 | Completing an operational wash records booking completion time, transaction references, and earned points in the shared store. |

### 4.6 Staff Operations

| BR ID | Rule |
|---|---|
| BR-78 | Staff dashboard links to `Operations` and `Check-in Queue` only. |
| BR-79 | Staff pages are accessible only to the `Staff` role. |
| BR-80 | Operations board shows booking code, customer, plate, service package, staff, scheduled time, check-in time, estimated finish time, status, and next action. |
| BR-81 | Staff queue supports filtering by status, time bucket, hour, staff, and free-text query. |
| BR-82 | The check-in panel requires a manual plate verification checkbox before enabling check-in. |
| BR-83 | `Start washing` is enabled only when the booking is already checked in. |
| BR-84 | `Complete wash` is enabled only when the booking is in progress. |
| BR-85 | Staff assignment uses only staff whose status is `Active`. |
| BR-86 | A busy staff member cannot be assigned to another non-completed wash session. |

### 4.7 Loyalty, Points, and Membership

| BR ID | Rule |
|---|---|
| BR-87 | The customer booking module uses customer tiers `Silver`, `Gold`, and `Diamond`. |
| BR-88 | The shared portal store uses tiers `Member`, `Silver`, `Gold`, and `Platinum`. |
| BR-89 | Customer point-to-voucher redemption requires at least 50 points and at most 200 points per voucher. |
| BR-90 | Customer point-to-voucher redemption rate is 1 point = 1,000 VND voucher value in the customer booking module. |
| BR-91 | A customer can hold at most 3 active point-redeem vouchers at the same time in the customer booking module. |
| BR-92 | Customer point-voucher redemption immediately subtracts available points and adds a `REDEEM` point transaction in the customer booking module. |
| BR-93 | Combo upgrade in the customer booking module awards a fixed bonus of 250 points. |
| BR-94 | Shared-store checkout calculates earned points from `floor(finalAmount / 10000) * tier multiplier`. |
| BR-95 | Shared-store checkout can redeem only whole loyalty points and caps redemption by customer balance and payable amount. |
| BR-96 | Shared-store reward redemption is blocked for blocked customers or insufficient balances. |
| BR-97 | Shared-store monthly tier review applies pending rule edits on the next review date and recalculates tiers from rolling 12-month points. |
| BR-98 | Shared-store earned loyalty lots expire after 365 days and can trigger warning notifications at 30-day and 7-day thresholds. |

### 4.8 Promotions, Vouchers, and Combos

| BR ID | Rule |
|---|---|
| BR-99 | Customer booking module treats promotions as voucher-like discounts, not as a separate pricing engine. |
| BR-100 | New-customer vouchers are usable only when the local customer profile is marked `isNewCustomer`. |
| BR-101 | Combo upgrade in customer booking is allowed only when the target combo is more expensive than the current active combo. |
| BR-102 | Combo upgrade requires at least one known vehicle to link the upgraded combo. |
| BR-103 | Shared-store promotions are validated by active flag, date range, and eligible shared-store tier at checkout. |
| BR-104 | Admin promotion form presents three targeting modes in UI: all members, selected tiers, and new customers only. |
| BR-105 | Admin promotion form requires a name, 1-100 discount percent, start date, end date, and at least one tier when targeting selected tiers. |
| BR-106 | In the shared store, the admin form's `new customers only` mode is currently translated into `Member` tier targeting, not into a true completed-booking eligibility check. |
| BR-107 | Shared-store promotion creation is blocked when start date is after end date. |
| BR-108 | Shared-store package removal is blocked if an active booking still references that package name. |
| BR-109 | Shared-store package status can be set to `ACTIVE` or `INACTIVE`. |

### 4.9 Admin Management UI

| BR ID | Rule |
|---|---|
| BR-110 | Admin dashboard KPI cards are derived from live shared-store bookings, transactions, and promotions. |
| BR-111 | Admin dashboard booking list can be filtered by date and paginated. |
| BR-112 | Admin bookings page supports filters for status, date, and customer name. |
| BR-113 | Admin bookings page maps `In Progress` from a combination of shared booking status `Checked-in` plus wash status `In Progress`. |
| BR-114 | Admin bookings page does not let users manually set `IN_PROGRESS`; that state is presented as operationally derived. |
| BR-115 | Booking detail drawer shows staff assignment as editable only when a linked wash session exists and that session status is `In Progress`. |
| BR-116 | Customer directory supports search, tier filter, status filter, pagination, and detail drilldown. |
| BR-117 | Customer detail tabs are `Profile`, `Vehicles`, `Bookings`, `Wash History`, `Point Transactions`, and `Tier History`. |
| BR-118 | Customer status changes persist to the shared store from admin detail view. |
| BR-119 | Customer role changes in admin detail view are presentation-only and are not persisted in this prototype. |
| BR-120 | Admin settings persist to browser localStorage on the current device. |
| BR-121 | Reports are computed from the shared store only and include booking trends, promotion effectiveness, point summaries, and no-show metrics. |

### 4.10 Notifications and Audit-Like Behavior

| BR ID | Rule |
|---|---|
| BR-122 | Customer reminder watcher polls every 30 seconds and fires toast/browser notifications for due reminders on `Pending` or `Confirmed` shared-store bookings. |
| BR-123 | Reminder notifications are deduplicated via reminder keys stored in localStorage. |
| BR-124 | Shared-store booking confirmation, checkout completion, auto-suspension, and loyalty expiry warnings push local notification items into the store. |
| BR-125 | Vehicle ownership transfers, tier changes, ledger entries, and adjustments are stored as audit-like local records, not immutable backend audit logs. |

---

## 5. Function to Business Rule Mapping

| Function / Area | Related BRs |
|---|---|
| Public homepage and guest routing | BR-01 to BR-05 |
| Demo login and role routing | BR-06 to BR-10 |
| Registration, OTP, and profile | BR-11 to BR-25 |
| Vehicle management | BR-26 to BR-39 |
| Customer booking checkout flow | BR-40 to BR-56 |
| Shared booking rules and operational lifecycle | BR-57 to BR-77 |
| Staff queue and check-in workflow | BR-78 to BR-86 |
| Loyalty, rewards, and tier handling | BR-87 to BR-98 |
| Promotions, vouchers, combos, and package governance | BR-99 to BR-109 |
| Admin dashboards and management pages | BR-110 to BR-121 |
| Reminders and audit-like records | BR-122 to BR-125 |

---

## 6. Reconciliation with Baseline README

The original baseline README described one coherent business specification. The current prototype diverges from that baseline in several observable ways:

| Baseline Expectation | Actual Prototype Behavior |
|---|---|
| Registration supports full name, email or phone, and password. | Current registration UI collects full name, phone, password, and OTP only. Email is not collected on the form. |
| Customer flow, staff flow, and admin flow share one booking domain model. | The repository currently splits customer booking logic and admin/staff portal logic across different stores. |
| Booking lifecycle is a single consistent path from customer booking to staff completion. | Customer booking pages simulate upfront payment and create module-local bookings, while staff/admin lifecycle works on shared-store bookings. |
| Combo, promotions, and package changes are globally consistent. | Customer booking module keeps its own mock combo/package/voucher state; admin changes apply to the shared store only. |
| Loyalty model centers on available points and lifetime points only. | Shared store also simulates monthly tier review, point expiry warnings, expiry sweeps, and admin adjustments. |
| No-show and cancellation behavior is simple and singular. | The code contains both 20-minute operational no-show handling and a 15-minute late-arrival path in legacy session preparation, plus optional auto-ban on repeated cancellations. |
| Promotion targeting semantics are fully aligned with business labels. | The admin UI exposes `new customers only`, but shared-store promotion logic currently translates that choice into `Member` tier targeting instead of an explicit new-customer history check. |
| Admin role/permission changes are system-wide. | Admin customer status updates persist, but role changes in customer detail are explicitly local-only in the current UI. |

Because of these differences, this README should be treated as the specification of actual prototype behavior, not as a normalized production design.

---

## 7. Open Assumptions and Prototype Notes

1. The repository contains a hybrid architecture. Customer booking pages and admin/staff pages do not yet share a fully unified booking, loyalty, package, and promotion state model.

2. Upfront payment simulation exists in the customer booking module, while operational checkout and loyalty posting also exist in the shared portal store. These are parallel prototype tracks rather than one integrated payment lifecycle.

3. Shared-store booking rules are stricter than what the current customer booking UI exposes. Examples include tier booking windows, max 3 active bookings, slot capacity, Platinum priority, cancellation auto-ban, and plate ownership transfer.

4. Admin wash package and promotion changes are live inside the shared portal store, but they do not fully drive the customer booking module's own package/combo/voucher mocks yet.

5. The admin promotion form is slightly ahead of the enforcement logic:
   - the UI offers `new customers only`
   - the shared store currently enforces that as `Member` tier targeting only

6. The customer area currently mixes module-local history and shared-store history:
   - `/customer/bookings` tabs use customer-booking mock history
   - `/customer/transactions` reads shared operational transactions

7. OTP, forgot password, payment success, browser notifications, and several audit-like records are all local simulations only.

8. If the team wants a single refined production-ready specification later, the first cleanup step should be consolidating customer booking, staff operations, and admin governance onto one shared business state model.
